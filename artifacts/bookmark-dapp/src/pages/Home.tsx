import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBookmarks } from "@/hooks/useBookmarks";
import { CONTRACT_ADDRESS, ROOTSTOCK_TESTNET, type Bookmark } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BookmarkPlus,
  ExternalLink,
  Loader2,
  LogOut,
  Tag,
  Trash2,
  Wallet,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function AddBookmarkForm({
  onAdd,
  isAdding,
}: {
  onAdd: (data: { title: string; url: string; tag: string }) => Promise<boolean>;
  isAdding: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAdd({ title, url: url.trim(), tag });
    if (success) {
      setTitle("");
      setUrl("");
      setTag("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookmarkPlus className="w-5 h-5" />
          Add Bookmark
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My favourite site"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tag">Tag (optional)</Label>
            <Input
              id="tag"
              placeholder="work, reading, dev…"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isAdding} className="w-full">
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving to blockchain…
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Bookmark
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BookmarkCard({
  bookmark,
  onDelete,
  isDeleting,
}: {
  bookmark: Bookmark;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="group">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-semibold text-primary hover:underline truncate"
            >
              {bookmark.title}
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <p className="text-sm text-muted-foreground truncate mt-0.5">{bookmark.url}</p>
            <div className="flex items-center gap-2 mt-2">
              {bookmark.tag && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Tag className="w-3 h-3" />
                  {bookmark.tag}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(Number(bookmark.createdAt) * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(bookmark.id)}
            disabled={isDeleting}
            title="Delete bookmark"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NoContractBanner() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Contract not configured.</strong> Set{" "}
        <code className="bg-muted px-1 rounded text-xs">VITE_CONTRACT_ADDRESS</code> in your
        environment to the deployed BookmarkManager address on Rootstock Testnet.
      </AlertDescription>
    </Alert>
  );
}

export default function Home() {
  const wallet = useWallet();
  const { bookmarks, isLoading, isAdding, deletingId, error, fetchBookmarks, addBookmark, deleteBookmark } =
    useBookmarks(wallet.signer);

  const [filterTag, setFilterTag] = useState("");

  useEffect(() => {
    if (wallet.address && wallet.isCorrectNetwork) {
      fetchBookmarks();
    }
  }, [wallet.address, wallet.isCorrectNetwork, fetchBookmarks]);

  const tags = Array.from(new Set(bookmarks.map((b) => b.tag).filter(Boolean)));

  const filteredBookmarks = filterTag
    ? bookmarks.filter((b) => b.tag === filterTag)
    : bookmarks;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">BookmarkChain</span>
            <Badge variant="outline" className="text-xs hidden sm:flex">
              Rootstock Testnet
            </Badge>
          </div>

          {wallet.address ? (
            <div className="flex items-center gap-2">
              {!wallet.isCorrectNetwork && (
                <Button variant="outline" size="sm" onClick={wallet.switchToRootstock}>
                  Switch Network
                </Button>
              )}
              <Badge variant="secondary" className="font-mono text-xs hidden sm:flex">
                {truncateAddress(wallet.address)}
              </Badge>
              <Button variant="ghost" size="icon" onClick={wallet.disconnect} title="Disconnect">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={wallet.connect} disabled={wallet.isConnecting} size="sm">
              {wallet.isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4 mr-2" />
              )}
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Wallet error */}
        {wallet.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{wallet.error}</AlertDescription>
          </Alert>
        )}

        {/* Not connected */}
        {!wallet.address ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Decentralized Bookmark Manager</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Save and manage your bookmarks on the blockchain. Connect your MetaMask wallet to
                get started — your bookmarks are stored on-chain and linked to your wallet address.
              </p>
            </div>
            <Button onClick={wallet.connect} disabled={wallet.isConnecting} size="lg">
              {wallet.isConnecting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5 mr-2" />
              )}
              Connect MetaMask
            </Button>
            <p className="text-xs text-muted-foreground">
              Rootstock Testnet (Chain ID: {ROOTSTOCK_TESTNET.chainId})
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Add form */}
            <div className="lg:col-span-1 space-y-4">
              {!CONTRACT_ADDRESS && <NoContractBanner />}
              <AddBookmarkForm onAdd={addBookmark} isAdding={isAdding} />

              {/* Network warning */}
              {!wallet.isCorrectNetwork && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are on the wrong network. Please switch to{" "}
                    <strong>Rootstock Testnet</strong>.
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto ml-1"
                      onClick={wallet.switchToRootstock}
                    >
                      Switch now
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Right: Bookmark list */}
            <div className="lg:col-span-2 space-y-4">
              {/* List header */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base">
                  My Bookmarks
                  {bookmarks.length > 0 && (
                    <span className="ml-2 text-muted-foreground font-normal text-sm">
                      ({filteredBookmarks.length})
                    </span>
                  )}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchBookmarks}
                  disabled={isLoading}
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Tag filter */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant={filterTag === "" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setFilterTag("")}
                  >
                    All
                  </Button>
                  {tags.map((t) => (
                    <Button
                      key={t}
                      variant={filterTag === t ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setFilterTag(t === filterTag ? "" : t)}
                    >
                      <Tag className="w-3 h-3" />
                      {t}
                    </Button>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading bookmarks from chain…
                </div>
              )}

              {/* Empty */}
              {!isLoading && !CONTRACT_ADDRESS && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Deploy the contract and set VITE_CONTRACT_ADDRESS to start saving bookmarks.</p>
                </div>
              )}

              {!isLoading && CONTRACT_ADDRESS && filteredBookmarks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {filterTag ? `No bookmarks tagged "${filterTag}"` : "No bookmarks yet. Add your first one!"}
                  </p>
                </div>
              )}

              {/* Bookmark cards */}
              <div className="space-y-3">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id.toString()}
                    bookmark={bookmark}
                    onDelete={deleteBookmark}
                    isDeleting={deletingId === bookmark.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
