import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const HOME_PAGE_PATH = '/'

export const revalidateHomePageAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  revalidatePath(HOME_PAGE_PATH)
  return doc
}

export const revalidateHomePageAfterDelete: CollectionAfterDeleteHook = async () => {
  revalidatePath(HOME_PAGE_PATH)
}
