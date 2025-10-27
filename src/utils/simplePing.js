// Función simple para hacer ping
export const pingAPI = async (url) => {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    console.log(`Ping to ${url} responded with status: ${response.status}`);
    return response.ok;
  } catch {
    return false;
  }
};