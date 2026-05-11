import type { TFunction } from 'i18next';

const inlineAllStyles = (source: HTMLElement, target: HTMLElement) => {
  const computed = window.getComputedStyle(source);
  const styleProps = [
    'color', 'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
    'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
    'borderColor', 'borderRadius', 'borderWidth', 'borderStyle',
    'font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'textAlign', 'textTransform', 'textDecoration', 'letterSpacing',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'flex', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'gap', 'order', 'flexGrow', 'flexShrink', 'flexBasis',
    'grid', 'gridTemplateColumns', 'gridTemplateRows', 'gridGap',
    'opacity', 'visibility', 'zIndex', 'boxShadow', 'overflow', 'whiteSpace', 'verticalAlign',
    'transform', 'transformOrigin', 'float', 'clear', 'listStyle',
  ];

  styleProps.forEach((prop) => {
    const val = computed[prop as any];
    if (val) {
      if (typeof val === 'string' && val.includes('oklch')) {
        (target.style as any)[prop] = '#000000';
      } else {
        (target.style as any)[prop] = val;
      }
    }
  });

  for (let i = 0; i < source.children.length; i++) {
    if (target.children[i]) {
      inlineAllStyles(source.children[i] as HTMLElement, target.children[i] as HTMLElement);
    }
  }
};

export async function downloadItineraryPdf(t: TFunction): Promise<void> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const content = document.querySelector('.max-w-4xl') as HTMLElement;
    if (!content) {
      alert(t('trips:itinerary.contentNotFound'));
      return;
    }

    document.body.style.cursor = 'wait';

    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 1280,
      ignoreElements: (element) => element.tagName === 'IFRAME',
      onclone: (clonedDoc) => {
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((s) => s.remove());

        const clonedContent = clonedDoc.querySelector('.max-w-4xl') as HTMLElement;
        if (clonedContent) {
          const scrollables = clonedContent.querySelectorAll('.overflow-y-auto, [class*="max-h-"]');
          scrollables.forEach((el) => {
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.height = 'auto';
            (el as HTMLElement).style.maxHeight = 'none';
          });

          inlineAllStyles(content, clonedContent);
          clonedContent.style.backgroundColor = '#ffffff';
          clonedContent.style.color = '#000000';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('RuntheK_Itinerary.pdf');
    document.body.style.cursor = 'default';
  } catch (error) {
    console.error('PDF Generation Error:', error);
    document.body.style.cursor = 'default';
    alert(t('trips:itinerary.pdfFailed'));
  }
}
