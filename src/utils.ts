export const resolveTextParams = (text: string, params: Record<string, string>)=>{
    let replaced = text

for (const [key, value] of Object.entries(params)) {
    replaced = replaced.replaceAll(`@${key}`, value)
  }

    return replaced
}