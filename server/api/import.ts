import type { Express } from 'express';
import { ApiError, ApiErrorNotImplemented, assertIsString, assertLoggedIn, definePostApi } from '../serverApiUtil';
import { ImportedFile, importFile } from '../import/importFile';

const MAX_IMPORT_FILE_SIZE = 20*1024*1024; //20MB

export function addImportEndpoints(app: Express)
{
  definePostApi<ApiTypes.ApiImport>(app, "/api/import", async (ctx) => {
    const _currentUser = assertLoggedIn(ctx);
    const fileName = assertIsString(ctx.body.fileName);
    const fileContentsBase64 = assertIsString(ctx.body.fileContents);
    const fileContentsBinary: Uint8Array = new Uint8Array(Buffer.from(fileContentsBase64, 'base64'));
    
    const fileSize = fileContentsBinary.length;
    if (fileSize > MAX_IMPORT_FILE_SIZE) {
      throw new ApiError("Imported file is larger than the maximum allowed size");
    }
    
    console.log(`Receiving upload of ${fileName} for import`);
    const _importResult: ImportedFile = await importFile(fileName, fileContentsBinary);
    // TODO
    
    throw new ApiErrorNotImplemented;
  });
}
