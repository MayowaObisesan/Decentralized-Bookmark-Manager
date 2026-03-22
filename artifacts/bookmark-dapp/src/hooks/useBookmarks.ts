import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { getSignerContract, CONTRACT_ADDRESS, type Bookmark } from "@/lib/contract";

export type BookmarkFormData = {
  title: string;
  url: string;
  tag: string;
};

export function useBookmarks(signer: ethers.JsonRpcSigner | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!signer || !CONTRACT_ADDRESS) return;

    setIsLoading(true);
    setError(null);
    try {
      const contract = getSignerContract(signer);
      const result = await contract.getBookmarks();
      setBookmarks(result as Bookmark[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookmarks");
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  const addBookmark = useCallback(
    async (data: BookmarkFormData) => {
      if (!signer || !CONTRACT_ADDRESS) return false;

      setIsAdding(true);
      setError(null);
      try {
        const contract = getSignerContract(signer);
        const tx = await contract.addBookmark(data.title, data.url, data.tag);
        await tx.wait();
        await fetchBookmarks();
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to add bookmark");
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [signer, fetchBookmarks]
  );

  const deleteBookmark = useCallback(
    async (id: bigint) => {
      if (!signer || !CONTRACT_ADDRESS) return;

      setDeletingId(id);
      setError(null);
      try {
        const contract = getSignerContract(signer);
        const tx = await contract.deleteBookmark(id);
        await tx.wait();
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      } catch (err: any) {
        setError(err.message || "Failed to delete bookmark");
      } finally {
        setDeletingId(null);
      }
    },
    [signer]
  );

  return {
    bookmarks,
    isLoading,
    isAdding,
    deletingId,
    error,
    fetchBookmarks,
    addBookmark,
    deleteBookmark,
  };
}
