export const runtime = "nodejs"; // safe default

export async function GET() {
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "YTF2HF33DN.com.dw5.jamsody",
          paths: ["*"],
        },
      ],
    },
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
