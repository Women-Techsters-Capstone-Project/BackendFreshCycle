const PDFDocument = require('pdfkit');

/**
 * Stream a simple receipt PDF to the provided response.
 * Signature: generateReceipt(order, items, res)
 */
exports.generateReceipt = async (order, items, res) => {
    try {
        if (!order || !res) {
            throw new Error('Order and response stream are required');
        }

        items = Array.isArray(items) ? items : [];

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${order.id || 'unknown'}.pdf`);

        doc.pipe(res);

        const fmt = v => (v == null ? '0.00' : Number(v).toFixed(2));

        doc.fontSize(18).text('AGRI-MARKET RECEIPT', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Order ID: ${order.id || ''}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Buyer ID: ${order.buyer_id || ''}`);
        doc.moveDown();

        doc.fontSize(12).text('Produce Name | Qty | Price | Subtotal', { underline: true });
        doc.moveDown(0.5);

        let total = 0;
        items.forEach(item => {
            const name = item.Produce?.name || item.name || 'Unknown';
            const qty = item.quantity || 0;
            const price = item.price_at_purchase ?? item.price ?? 0;
            const subtotal = Number(qty) * Number(price);
            total += subtotal;

            doc.text(`${name} | ${qty}kg | $${fmt(price)} | $${fmt(subtotal)}`);
        });

        doc.moveDown();
        const paid = order.total_amount ?? order.total_price ?? total;
        doc.fontSize(14).text(`TOTAL PAID: $${fmt(paid)}`, { continued: false });

        doc.end();
    } catch (err) {
        // If response headers are not sent yet, return a 500 JSON error
        try {
            if (!res.headersSent) res.status(500).json({ error: 'Receipt generation failed', details: err.message });
            else res.end();
        } catch (e) {
            // swallow
        }
    }
};