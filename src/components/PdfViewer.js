import { h, Component } from 'preact';
import { PDFDocument } from 'pdf-lib';

class PdfViewer extends Component {
    state = {
        pageImages: []
    };

    async componentDidMount() {
        try {
            const pdfDoc = await PDFDocument.load(this.props.pdfData);
            const pages = pdfDoc.getPages();
            const pageImages = await Promise.all(pages.map(async (page) => {
                // Convert the page to an image (e.g., PNG)
                // This step depends on your specific method of conversion
                const pageImage = await convertPageToImage(page);
                return pageImage;
            }));
            
            this.setState({ pageImages });
        } catch (error) {
            console.error('Error processing PDF:', error);
        }
    }

    render() {
        return (
            <div>
                {this.state.pageImages.map((imgSrc, index) => (
                    <img key={index} src={imgSrc} alt={`Page ${index + 1}`} />
                ))}
            </div>
        );
    }
}

export default PdfViewer;
