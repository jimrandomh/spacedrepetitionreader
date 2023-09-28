import { User } from "@prisma/client";
import { ExportOptions } from "../../lib/importTypes";
import { ApiErrorNotImplemented } from "../serverApiUtil";

export async function exportFile(_options: ExportOptions, _currentUser: User, _deckIds: string[]) {
  throw new ApiErrorNotImplemented();
}
