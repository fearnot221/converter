export async function POST(req: Request) {
    try {
      const { signature, originalData, secretLength, appendData } = await req.json();
      
      if (!signature || !originalData || !secretLength || !appendData) {
        return new Response(
          JSON.stringify({ error: '所有欄位都必須填寫' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
  
      // 調用部署在另一個 Vercel 的 Flask API
      const response = await fetch('https://convert.api.fearnot221.com/api/crypto/lea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signature,
          originalData,
          secretLength,
          appendData
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
  
      return new Response(
        JSON.stringify(data),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error processing lea:', error);
      return new Response(
        JSON.stringify({ error: '處理請求時發生錯誤' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }