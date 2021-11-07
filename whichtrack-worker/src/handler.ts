declare const METROLINX_API_KEY: string

export async function handleRequest(request: Request): Promise<Response> {
  if (!METROLINX_API_KEY) {
    throw new Error(
      'METROLINX_API_KEY must be defined in cloudflare worker secrets',
    )
  }

  const baseURL = 'http://api.openmetrolinx.com/OpenDataAPI/api/V1'
  const key = METROLINX_API_KEY
  const makeURL = (u: string) => `${baseURL}${u}?key=${key}`

  const { pathname, searchParams } = new URL(request.url)

  let stopID
  if (pathname.endsWith('/mimico')) stopID = 'MI'
  else if (pathname.endsWith('/exhibition')) stopID = 'EX'
  else if (pathname.endsWith('/union')) stopID = 'UN'
  else if (pathname.endsWith('/appleby')) stopID = 'AP'
  else {
    console.log({ searchParams })
    const match = pathname.match(/^\/([A-Za-z0-9]+)/)
    if (match) {
      stopID = match[1]
    }
  }

  if (!stopID) {
    return new Response(
      'Try /mimico, /exhibition, /union, /00263 - use ?details=true for full JSON',
      { status: 404 },
    )
  }

  const url = makeURL(`/Stop/NextService/${stopID}`)
  const response = await fetch(url)

  // TODO: add types for Metrolinx API reponses ;)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await response.json()) as any

  if (searchParams.get('details')) {
    return new Response(JSON.stringify(json))
  }

  if (json.Metadata?.ErrorCode === '204') {
    return new Response('No vehicles found. (204)', { status: 200 })
  }

  const asOf = json.MetaData?.TimeStamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lines = json.NextService?.Lines?.map((l: any) => {
    return {
      code: l.LineCode,
      name: l.LineName,
      direction: l.DirectionCode,
      directionName: l.DirectionName,
      platform: l.ScheduledPlatform,
      platformActual: l.ActualPlatform,
      scheduledAt: l.ScheduledDepartureTime,
    }
  })

  let output = `Last update: ${asOf}:\n\n`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output += lines.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (l: any) =>
      `${l.directionName}: ${l.scheduledAt} platform=${l.platform} actualPlatform=${l.platformActual}\n`,
  )

  return new Response(output)
}
