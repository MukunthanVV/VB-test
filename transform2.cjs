const fs = require('fs');

const files = [
    'src/pages/VBMotorsPage.tsx',
    'src/pages/UsedCarsPage.tsx',
    'src/pages/EventsPage.tsx',
    'src/pages/RealEstatePage.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We already have:
    // <div className="flex flex-col md:flex-row bg-[...] dark:bg-[...] rounded-[2rem] overflow-hidden shadow-xl w-full">
    // and md:flex-row-reverse.
    // However, maybe we should explicitly make sure they are alternating properly.
    
    // Let's reset the structure. First, read all blocks that match the pattern.
    // Instead of regex replaces on pieces, let's replace the widths.
    // old: w-full md:w-[45%] -> new: w-full md:w-[60%]
    // old: w-full md:w-[55%] -> new: w-full md:w-[40%]
    
    content = content.replace(/md:w-\[45%\]/g, 'md:w-[60%]');
    content = content.replace(/md:w-\[55%\]/g, 'md:w-[40%]');
    
    // Ensure the image has h-full or similar to span the container height if needed, 
    // but right now it has min-h-[300px] md:min-h-[400px].
    // Let's make sure it is flex flex-col md:flex-row and md:flex-row-reverse.
    // The previous script did this:
    // flex-dir = cardCount % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row';
    // This means card 1 (count 1) gets md:flex-row.
    // Card 2 (count 2) gets md:flex-row-reverse.
    // So this is already alternating.
    
    fs.writeFileSync(file, content);
});

console.log("Done");
