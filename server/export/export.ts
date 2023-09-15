import { User } from "@prisma/client";
import { ExportOptions } from "../../lib/importTypes";
import { ApiErrorNotImplemented } from "../serverApiUtil";

export async function exportFile(options: ExportOptions, currentUser: User, deckIds: string[]) {
  throw new ApiErrorNotImplemented();
}
