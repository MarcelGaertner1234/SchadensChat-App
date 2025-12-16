/**
 * Icon Generator for iOS and Android
 * Generates all required icon sizes from the base SVG using sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// iOS icon sizes (name: size)
const iosIcons = {
    'AppIcon-20@1x': 20,
    'AppIcon-20@2x': 40,
    'AppIcon-20@3x': 60,
    'AppIcon-29@1x': 29,
    'AppIcon-29@2x': 58,
    'AppIcon-29@3x': 87,
    'AppIcon-40@1x': 40,
    'AppIcon-40@2x': 80,
    'AppIcon-40@3x': 120,
    'AppIcon-60@2x': 120,
    'AppIcon-60@3x': 180,
    'AppIcon-76@1x': 76,
    'AppIcon-76@2x': 152,
    'AppIcon-83.5@2x': 167,
    'AppIcon-512@2x': 1024
};

// Android icon sizes (folder: size)
const androidIcons = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
};

// Paths
const basePath = path.join(__dirname, '..');
const svgPath = path.join(basePath, 'img', 'icon.svg');
const iosIconsPath = path.join(basePath, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
const androidResPath = path.join(basePath, 'android', 'app', 'src', 'main', 'res');

// Convert SVG to PNG at specified size
async function convertSvgToPng(inputSvg, outputPng, size) {
    const svgContent = fs.readFileSync(inputSvg, 'utf8');

    await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPng);
}

// Generate iOS icons
async function generateIosIcons() {
    console.log('\n📱 Generating iOS icons...');

    if (!fs.existsSync(iosIconsPath)) {
        fs.mkdirSync(iosIconsPath, { recursive: true });
    }

    for (const [name, size] of Object.entries(iosIcons)) {
        const outputPath = path.join(iosIconsPath, `${name}.png`);
        console.log(`  Creating ${name}.png (${size}x${size})`);
        try {
            await convertSvgToPng(svgPath, outputPath, size);
        } catch (err) {
            console.error(`  Error creating ${name}: ${err.message}`);
        }
    }

    // Generate Contents.json for iOS
    const contents = {
        images: Object.entries(iosIcons).map(([name, size]) => {
            const parts = name.match(/AppIcon-(\d+\.?\d*)@?(\d?)x?/);
            const baseSize = parts[1];
            const scale = parts[2] || '1';

            let idiom = 'iphone';
            if (parseFloat(baseSize) === 76 || parseFloat(baseSize) === 83.5) {
                idiom = 'ipad';
            } else if (size === 1024) {
                idiom = 'ios-marketing';
            }

            return {
                filename: `${name}.png`,
                idiom: idiom,
                scale: `${scale}x`,
                size: `${baseSize}x${baseSize}`
            };
        }),
        info: {
            author: 'xcode',
            version: 1
        }
    };

    fs.writeFileSync(
        path.join(iosIconsPath, 'Contents.json'),
        JSON.stringify(contents, null, 2)
    );

    console.log('✅ iOS icons generated!');
}

// Generate Android icons
async function generateAndroidIcons() {
    console.log('\n🤖 Generating Android icons...');

    for (const [folder, size] of Object.entries(androidIcons)) {
        const folderPath = path.join(androidResPath, folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Standard icon
        const iconPath = path.join(folderPath, 'ic_launcher.png');
        console.log(`  Creating ${folder}/ic_launcher.png (${size}x${size})`);
        try {
            await convertSvgToPng(svgPath, iconPath, size);
        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }

        // Round icon
        const roundPath = path.join(folderPath, 'ic_launcher_round.png');
        console.log(`  Creating ${folder}/ic_launcher_round.png (${size}x${size})`);
        try {
            await convertSvgToPng(svgPath, roundPath, size);
        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }

        // Foreground for adaptive icons
        const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.png');
        console.log(`  Creating ${folder}/ic_launcher_foreground.png (${size}x${size})`);
        try {
            await convertSvgToPng(svgPath, foregroundPath, size);
        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }
    }

    console.log('✅ Android icons generated!');
}

// Main
async function main() {
    console.log('🎨 SchadensChat Icon Generator');
    console.log('================================');

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
        console.error(`Error: Source SVG not found at ${svgPath}`);
        process.exit(1);
    }

    console.log(`Source: ${svgPath}`);

    try {
        await generateIosIcons();
        await generateAndroidIcons();

        console.log('\n✨ All icons generated successfully!');
        console.log('\nNext steps:');
        console.log('1. Run: npm run sync');
        console.log('2. Open Xcode/Android Studio to verify icons');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

main();
