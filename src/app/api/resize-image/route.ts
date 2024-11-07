import sharp from 'sharp';

export async function POST(req: Request) {
    try {
        const { image, width, height } = await req.json();

        if (!image || !width || !height) {
            return new Response(
                JSON.stringify({ error: 'Invalid input' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
        
        // 使用 sharp 判斷原圖片格式
        const metadata = await sharp(imageBuffer).metadata();
        const format = metadata.format;

        if (!format) {
            return new Response(
                JSON.stringify({ error: 'Failed to determine image format' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 根據原始格式轉換
        const resizedBuffer = await sharp(imageBuffer)
            .resize(width, height)
            .toFormat(format)  // 保留原始格式
            .toBuffer();

        return new Response(
            JSON.stringify({
                image: `data:image/${format};base64,${resizedBuffer.toString('base64')}`,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error resizing image:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to resize image' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
