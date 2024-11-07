import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    // 從請求中解析 JSON 內容
    const { image } = await req.json();
    
    if (!image) {
      // 檢查是否有傳送圖片資料
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 解碼圖片
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');

    // 使用 sharp 進行圖片格式轉換
    const jpgBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    // 返回轉換後的圖片資料
    return new Response(
      JSON.stringify({
        image: `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    // 捕獲錯誤並返回 500 錯誤
    return new Response(
      JSON.stringify({ error: 'Failed to convert image. Please try again later.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 配置 API 設定
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',  // 限制上傳圖片的最大尺寸
    },
  },
};
