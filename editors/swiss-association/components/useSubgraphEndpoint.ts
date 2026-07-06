import {
  DriveCollectionId,
  useSelectedDrive,
  useSyncList,
} from "@powerhousedao/reactor-browser";

// Reads the resolved GraphQL endpoint URL from a sync remote's channel config,
// tolerating the framework's loosely-typed channel shape.
function readChannelUrl(remote: unknown): string | undefined {
  if (!remote || typeof remote !== "object") return undefined;
  const channel = (remote as { channel?: unknown }).channel;
  if (!channel || typeof channel !== "object") return undefined;
  const config = (channel as { config?: unknown }).config;
  if (!config || typeof config !== "object") return undefined;
  const url = (config as { url?: unknown }).url;
  return typeof url === "string" ? url : undefined;
}

// Resolves the Switchboard GraphQL endpoint for the remote drive the currently
// selected document belongs to (undefined for local-only drives with no remote).
export function useSubgraphEndpoint(): string | undefined {
  const [drive] = useSelectedDrive();
  const remotes = useSyncList();

  const driveId = drive.header.id;
  if (!driveId) return undefined;

  const target = DriveCollectionId.forDrive(driveId);
  const remote = remotes.find((r) => r.collectionId.equals(target));
  return readChannelUrl(remote);
}
