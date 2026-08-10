import React, { useRef, useState } from 'react';
import { FileText, Printer, Download, X, Building2, ShieldCheck, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../../types';

interface TaxInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export function TaxInvoiceModal({ order, onClose }: TaxInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsDownloading(true);
      const element = printRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Tax-Invoice-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate invoice PDF', error);
      alert('Failed to generate PDF. You can also use the Print button to Save as PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const subtotal = order.totalAmount ? order.totalAmount / 1.12 : 0; // 12% GST breakdown
  const gstAmount = order.totalAmount ? order.totalAmount - subtotal : 0;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#163522]/60 p-4 sm:p-6 flex justify-center items-start min-h-screen backdrop-blur-xs">
      {/* Printable Invoice Container */}
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#cdd5bd] bg-white shadow-2xl my-auto sm:my-8 text-xs text-[#1c3e29] overflow-hidden">
        
        {/* Modal Action Header (Sticky Top, Hidden on Print) */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#e2e7da] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e0ecc0] text-[#244f36] shrink-0">
              <FileText size={20} />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#1c3e29] leading-tight">GST Commercial Tax Invoice</h2>
              <p className="text-[10px] text-[#718274]">Official Tax Invoice for Order {order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#244f36] px-4 py-2 text-xs font-bold text-white hover:bg-[#183d2a] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isDownloading ? 'Generating PDF...' : 'Download PDF Invoice'}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ccd6c5] bg-[#fbfcf6] px-3.5 py-2 text-xs font-bold text-[#244f36] hover:bg-[#eaf1d8] transition-colors cursor-pointer"
            >
              <Printer size={14} /> Print
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-[#ccd6c5] p-2 text-[#57685b] hover:bg-[#f0f4ea] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div ref={printRef} className="space-y-6 printable-area bg-white p-4 sm:p-6 rounded-2xl border border-[#e8eddf]">
            {/* Invoice Top Brand & Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#dce3d2] pb-6">
              <div>
                <div className="flex items-center gap-2 text-lg font-bold text-[#1c3e29]">
                  <Building2 size={22} className="text-[#658e38]" />
                  <span>SOLARGRID ENERGY SYSTEMS PVT. LTD.</span>
                </div>
                <p className="text-[11px] text-[#55695a] mt-1.5 leading-relaxed">
                  Plot 42, Green Energy Corridor, Tech Park Phase 2<br />
                  GSTIN: <b>37AAACS1234F1Z9</b> | CIN: U40106AP2026PTC081234<br />
                  Support: 1800-SOLARGRID | billing@solargrid.com
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 shrink-0">
                <span className="inline-block rounded-lg bg-[#e0ecc0] px-3 py-1 text-xs font-bold text-[#2d5231]">
                  TAX INVOICE
                </span>
                <b className="block text-sm font-bold text-[#1c3e29]">INV-2026-{order.orderNumber.replace('SG-2026-', '')}</b>
                <span className="block text-[10px] text-[#718274]">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                <span className="block text-[10px] font-bold text-[#244f36]">Status: PAYMENT CONFIRMED</span>
              </div>
            </div>

            {/* Customer & Order Metadata Grid */}
            <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-[#e2e7da] bg-[#fbfcf6] p-4 text-xs">
              <div>
                <b className="block font-bold uppercase text-[#718274] text-[10px] mb-1">Billed & Shipped To:</b>
                <b className="text-sm font-bold text-[#1c3e29]">{order.customerName || 'Valued Solar Customer'}</b>
                <p className="text-[#55695a] mt-1 leading-relaxed">{order.addressText || 'Registered Installation Address'}</p>
              </div>

              <div className="space-y-1 sm:text-right">
                <b className="block font-bold uppercase text-[#718274] text-[10px] mb-1">Order Details:</b>
                <p>Order Reference: <b>{order.orderNumber}</b></p>
                <p>Installation Option: <b>{order.installationType === 'SOLARGRID_INSTALLER' ? 'SolarGrid Crew Installation' : 'Direct Supply'}</b></p>
                <p>HSN/SAC Code: <b>84128030 (Solar Equipment)</b></p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-hidden rounded-2xl border border-[#dce3d2]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#e8eddf] text-[#244f36] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Product Description & SKU</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">GST Rate</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e7da]">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-[#fbfcf6]">
                        <td className="p-3 font-semibold">{idx + 1}</td>
                        <td className="p-3">
                          <b className="text-[#1c3e29] block">{item.productName}</b>
                          <span className="mono text-[10px] text-[#718274]">SKU: {item.sku}</span>
                        </td>
                        <td className="p-3 text-center font-bold">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right">12%</td>
                        <td className="p-3 text-right font-bold text-[#1c3e29]">
                          ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-semibold">1</td>
                      <td className="p-3">
                        <b className="text-[#1c3e29] block">Commercial Solar Equipment & System Supply</b>
                        <span className="mono text-[10px] text-[#718274]">SKU: SG-SOLAR-SYS</span>
                      </td>
                      <td className="p-3 text-center font-bold">1</td>
                      <td className="p-3 text-right">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">12%</td>
                      <td className="p-3 text-right font-bold text-[#1c3e29]">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
              <div className="max-w-xs space-y-2 text-[11px] text-[#637568]">
                <div className="flex items-center gap-1.5 font-bold text-[#244f36]">
                  <ShieldCheck size={16} />
                  <span>25-Year Performance Warranty Included</span>
                </div>
                <p>This invoice serves as the official warranty certificate for all Tier-1 Mono PERC modules and hybrid inverters listed.</p>
              </div>

              <div className="w-full sm:w-64 space-y-2 rounded-2xl border border-[#dce3d2] bg-[#fbfcf6] p-4 text-xs">
                <div className="flex justify-between text-[#55695a]">
                  <span>Taxable Base Amount:</span>
                  <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#55695a]">
                  <span>CGST (6%):</span>
                  <span>₹{Math.round(cgst).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#55695a]">
                  <span>SGST (6%):</span>
                  <span>₹{Math.round(sgst).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-[#e2e7da] pt-2 text-sm font-bold text-[#1c3e29]">
                  <span>Grand Total Payable:</span>
                  <span className="text-[#244f36]">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer Sign-off */}
            <div className="border-t border-[#e2e7da] pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#718274] gap-4">
              <div>
                <p className="font-bold text-[#1c3e29]">Terms & Declarations:</p>
                <p>Goods once delivered are subject to standard solar warranty claims and returns policy.</p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="h-8 border-b border-dashed border-[#a6b89c] w-40 mx-auto sm:ml-auto mb-1" />
                <b className="block text-[#1c3e29]">Authorized Signatory</b>
                <span>SolarGrid Energy Systems</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
