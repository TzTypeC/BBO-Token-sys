/**
 * Read and parse the Request body supporting both
 * `application/json` and `application/x-www-form-urlencoded`.
 *
 * Usage: `const body = await getBody(request);`
 */
export async function getBody<T = any>(req: Request): Promise<T> {
  const contentType = (req.headers.get('content-type') || '').toLowerCase();

  const parseUrlEncoded = async (text: string) => {
    const params = new URLSearchParams(text);
    const obj: Record<string, any> = {};
    for (const [key, value] of params) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (Array.isArray(obj[key])) obj[key].push(value);
        else obj[key] = [obj[key], value];
      } else {
        obj[key] = value;
      }
    }
    return obj as T;
  };

  try {
    // Read raw text first. Using `text()` is consistent across content types
    // and avoids some runtime JSON parse errors from fetch's `json()`.
    let text: string;
    try {
      text = await req.text();
    } catch (e) {
      throw new Error(String(e instanceof Error ? e.message : e));
    }

    if (!text) return ({} as T);

    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(text) as T;
      } catch (_) {
        // If malformed JSON, still try urlencoded
        if (text.includes('=') && text.includes('&')) return await parseUrlEncoded(text);
        return text as unknown as T;
      }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      return await parseUrlEncoded(text);
    }

    // Fallback: try to detect form-encoded, then JSON, else return raw text
    if (text.includes('=') && text.includes('&')) return await parseUrlEncoded(text);
    try {
      return JSON.parse(text) as T;
    } catch (_) {
      return text as T;
    }
  } catch (err) {
    throw new Error(
      `getBody: failed to parse request body - ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export default getBody;
