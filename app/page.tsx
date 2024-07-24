import { AspectProvider } from "@/components/aspect/aspect-provider";
import { AspectIDE } from "@/components/aspect/ide";
import { getTypescriptContract } from "@/lib/aspect/loader";

interface SearchParams {
  params: { slug: string }
  searchParams?: { [key: string]: string | undefined }
}
export default async function Home({ searchParams }: SearchParams) {
  let url =
    "https://github.com/solide-project/solide-guides/blob/master/src/aspect/other/HelloWorld/hello-world.ts"
  searchParams?.url && (url = searchParams.url)

  const data = await getTypescriptContract(url)
  if (typeof data === "string") {
    return <div>{data}</div>
  }

  return <AspectProvider>
    <AspectIDE url={url}
      content={JSON.stringify(data)}
      title={url.replace(
        /https:\/\/github.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\//,
        ""
      )} />
  </AspectProvider>
}
