import type { Express } from 'express';
import { ApiError, ApiErrorAccessDenied, ApiErrorImportFailed, ApiErrorNotFound, assertIsString, assertLoggedIn, definePostApi } from '../serverApiUtil';
import { importFile } from '../import/importFile';
import crypto from 'crypto';
import type { ImportedFile } from '../../lib/importTypes';

const MAX_IMPORT_FILE_SIZE = 20*1024*1024; //20MB

export function addImportEndpoints(app: Express)
{
  definePostApi<ApiTypes.ApiUploadForImport>(app, "/api/uploadForImport", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const fileName = assertIsString(ctx.body.fileName);
    const fileContentsBase64 = assertIsString(ctx.body.fileContents);
    const fileContentsBuffer = Buffer.from(fileContentsBase64, 'base64')
    
    const fileSize = fileContentsBuffer.length;
    if (fileSize > MAX_IMPORT_FILE_SIZE) {
      throw new ApiError("Imported file is larger than the maximum allowed size");
    }
    
    const sha256sum = bufferToSha256sum(fileContentsBuffer);
    
    // Check whether this file has already been uploaded; if not, add its body
    // (keyed by hash) to the DB.
    console.log(`Adding contents of file with hash ${sha256sum} body to the DB`);
    const existingUpload = await ctx.db.uploadedFileBody.findMany({
      where: { sha256sum }
    });
    if (!existingUpload.length) {
      await ctx.db.uploadedFileBody.upsert({
        where: { sha256sum },
        create: {
          sha256sum,
          contents: fileContentsBuffer,
        },
        update: {},
      });
    }
    
    // Add metadata about the upload to do the DB
    const fileUpload = await ctx.db.fileUpload.create({
      data: {
        filename: fileName,
        uploaderUserId: currentUser.id,
        sha256sum: sha256sum,
        uploadType: "import",
      },
    });

    // Parse the file and return a preview
    const fileContentsBinary: Uint8Array = new Uint8Array(fileContentsBuffer);
    const importResult: ImportedFile = await importFile(fileName, fileContentsBinary);
    
    return {
      importFileId: fileUpload.id,
      preview: importResult,
    };
  });
  
  definePostApi<ApiTypes.ApiConfirmImport>(app, "/api/confirmImport", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const fileId = assertIsString(ctx.body.fileId);
    
    const fileUpload = await ctx.db.fileUpload.findUnique({
      where: {
        id: fileId,
      },
    });
    if (!fileUpload) {
      throw new ApiErrorNotFound();
    }
    if (fileUpload.uploaderUserId !== currentUser.id) {
      throw new ApiErrorAccessDenied();
    }
    
    const fileContents = await ctx.db.uploadedFileBody.findUnique({
      where: {
        sha256sum: fileUpload.sha256sum,
      },
    });
    if (!fileContents) {
      throw new ApiErrorNotFound();
    }
    
    const fileContentsBinary: Uint8Array = new Uint8Array(fileContents.contents);
    const importResult: ImportedFile = await importFile(fileUpload.filename, fileContentsBinary);
    
    if (!importResult.decks.length) {
      throw new ApiErrorImportFailed("Imported file did not contain any decks");
    }
    
    let firstImportedDeckId: string|null = null;

    for (const deck of importResult.decks) {
      const importedDeckName = (deck.metadata.name && deck.metadata.name.length>0)
        ? deck.metadata.name : "Imported Deck";
      const importedDeckDescription = "";
      
      const createdDeck = await ctx.db.deck.create({
        data: {
          name: importedDeckName,
          authorId: currentUser.id,
          config: {},
          description: importedDeckDescription,
          cards: {
            createMany: {
              data: deck.cards.map(importedCard => ({
                front: importedCard.front,
                back: importedCard.back,
              })),
            },
          },
        },
      });
      if (!firstImportedDeckId) {
        firstImportedDeckId = createdDeck.id;
      }
    }
    
    return {
      deckId: firstImportedDeckId!,
    };
  });
}


function bufferToSha256sum(buffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
