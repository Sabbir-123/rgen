"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Shop, Customer, Invoice, InvoiceItem } from "@/lib/db";
import { amountToWords } from "@/lib/numberToWords";
import { formatDateString } from "@/lib/utils";

// Helper to generate a simple Code-39 or simple representation barcode SVG
function BarcodeSVG({ value }: { value: string }) {
  // Simple representation of barcode lines for display and print stability
  // Using 40 lines of varying widths
  const hash = Math.abs(
    value.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  );
  const pattern = (hash.toString(2) + "101100101011").repeat(3).substring(0, 45);
  
  return (
    <div className="flex flex-col items-center">
      <svg width="150" height="35" viewBox="0 0 150 35" className="w-[120px] h-[30px]">
        <g fill="black">
          {pattern.split("").map((bit, idx) => {
            const width = bit === "1" ? 3 : 1;
            const x = idx * 3.2;
            if (idx % 2 === 0) {
              return <rect key={idx} x={x} y="0" width={width} height="30" />;
            }
            return null;
          })}
        </g>
      </svg>
      <span className="text-[9px] font-mono tracking-widest text-zinc-500">{value}</span>
    </div>
  );
}

interface TemplateProps {
  invoice: Invoice;
  language?: "en" | "bn";
}

// Translations for Invoice
const templateTranslations = {
  en: {
    invoice: "INVOICE",
    bill: "BILL",
    challan: "CHALLAN",
    receipt: "RECEIPT",
    invoiceNo: "Invoice No",
    date: "Date",
    customerInfo: "Bill To",
    name: "Name",
    mobile: "Mobile",
    address: "Address",
    sl: "SL",
    description: "Item Description",
    qty: "Qty",
    rate: "Rate",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    vat: "VAT",
    advance: "Advance",
    due: "Due",
    paid: "Paid Amount",
    amountInWords: "Amount in Words",
    authorizedSignature: "Authorized Signature",
    customerSignature: "Customer Signature",
    tin: "TIN",
    bin: "BIN",
    facebook: "Facebook",
    bismillah: "Bismillahir Rahmanir Rahim",
    validity: "Validity",
    paymentMethod: "Payment Method",
    terms: "Term & Condition",
    manager: "Manager",
    value: "VALUE",
  },
  bn: {
    invoice: "ইনভয়েস",
    bill: "বিল",
    challan: "চালান",
    receipt: "রশিদ",
    invoiceNo: "ইনভয়েস নং",
    date: "তারিখ",
    customerInfo: "ক্রেতার তথ্য",
    name: "নাম",
    mobile: "মোবাইল",
    address: "ঠিকানা",
    sl: "ক্র নং",
    description: "বিবরণ",
    qty: "পরিমাণ",
    rate: "দর",
    total: "মোট",
    subtotal: "সর্বমোট",
    discount: "ডিসকাউন্ট",
    vat: "ভ্যাট",
    advance: "অগ্রিম",
    due: "বকেয়া",
    paid: "পরিশোধিত",
    amountInWords: "কথায়",
    authorizedSignature: "অনুমোদিত স্বাক্ষর",
    customerSignature: "গ্রাহকের স্বাক্ষর",
    tin: "টিন",
    bin: "বিন",
    facebook: "ফেসবুক",
    bismillah: "বিসমিল্লাহির রাহমানির রাহিম",
    validity: "মেয়াদ",
    paymentMethod: "পেমেন্ট মাধ্যম",
    terms: "শর্তাবলী",
    manager: "ম্যানেজার",
    value: "মূল্য",
  }
};

export default function InvoiceTemplate({ invoice, language = "en" }: TemplateProps) {
  const t = templateTranslations[language];
  const { shop = {} as Shop, customer = {} as Customer, items = [] } = invoice;
  
  // Base watermark style
  const watermarkStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    opacity: 0.06,
    filter: "grayscale(100%)",
    fontSize: "90px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
    pointerEvents: "none",
    zIndex: 0,
    whiteSpace: "nowrap",
  };

  // Convert numbers to local characters if Bengali
  const formatNumber = (num: number) => {
    if (language === "en") return num.toFixed(2);
    // Bengali digits mapping
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toFixed(2)
      .replace(/\d/g, (d) => bnDigits[parseInt(d, 10)])
      .replace(".", ",");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "text-green-600 border-green-600 bg-green-50";
      case "PARTIAL": return "text-amber-600 border-amber-600 bg-amber-50";
      default: return "text-red-600 border-red-600 bg-red-50";
    }
  };

  // ----------------------------------------------------
  // TEMPLATE 1: Classic Bangladeshi Receipt Book (Yellowish Ink Press)
  // ----------------------------------------------------
  if (invoice.template_id === 1) {
    return (
      <div className="relative w-full h-full p-8 font-serif text-zinc-950 bg-[#FFF2CC]/30 border-4 border-double border-amber-800/40 rounded shadow-sm overflow-hidden select-none flex flex-col justify-between">
        {/* Watermark logo or shop name */}
        <div style={watermarkStyle}>
          {shop.name ? shop.name.toUpperCase() : "BD PRINTING"}
        </div>

        <div className="relative z-10 space-y-4">
          {/* Header Bismillah */}
          <div className="text-center text-xs italic text-amber-900/80 mb-1">
            {t.bismillah}
          </div>

          {/* Shop Header */}
          <div className="flex justify-between items-start border-b border-amber-800/20 pb-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-amber-900 tracking-wide uppercase">
                {shop.name || "BD Printing Zone"}
              </h1>
              <p className="text-xs font-sans text-zinc-700 italic">
                {shop.category || "All kinds of offset and digital prints"}
              </p>
              <p className="text-xs text-zinc-800">
                {shop.address || "Dhaka, Bangladesh"}
              </p>
              <p className="text-xs text-zinc-800 font-sans">
                {t.mobile}: {shop.mobile || "+8801700000000"} {shop.email && `| Email: ${shop.email}`}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 text-xs font-bold border rounded uppercase ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
              {shop.bin && <span className="text-[10px] text-zinc-600">{t.bin}: {shop.bin}</span>}
              {shop.tin && <span className="text-[10px] text-zinc-600">{t.tin}: {shop.tin}</span>}
            </div>
          </div>

          {/* Bill Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-amber-50/50 p-3 border border-amber-200 rounded">
            <div className="space-y-1">
              <div className="flex gap-2">
                <span className="font-bold min-w-[70px]">{t.name}:</span>
                <span className="border-b border-dashed border-zinc-400 flex-1">{customer.name || "Walk-in Customer"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[70px]">{t.address}:</span>
                <span className="border-b border-dashed border-zinc-400 flex-1">{customer.address || "N/A"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[70px]">{t.mobile}:</span>
                <span className="border-b border-dashed border-zinc-400 flex-1 font-sans">{customer.mobile || "N/A"}</span>
              </div>
            </div>
            
            <div className="space-y-1 flex flex-col items-end justify-between">
              <div className="w-full flex justify-end gap-2">
                <span className="font-bold">{t.invoiceNo}:</span>
                <span className="font-mono text-amber-900 font-bold border-b border-dashed border-zinc-400 px-1">
                  {invoice.invoice_number}
                </span>
              </div>
              <div className="w-full flex justify-end gap-2">
                <span className="font-bold">{t.date}:</span>
                <span className="border-b border-dashed border-zinc-400 px-1 font-sans">
                  {formatDateString(invoice.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-zinc-400 text-sm">
            <thead>
              <tr className="bg-amber-100/50">
                <th className="border border-zinc-400 px-2 py-1.5 w-[5%]">{t.sl}</th>
                <th className="border border-zinc-400 px-3 py-1.5 text-left w-[55%]">{t.description}</th>
                <th className="border border-zinc-400 px-2 py-1.5 text-right w-[12%] font-sans">{t.qty}</th>
                <th className="border border-zinc-400 px-2 py-1.5 text-right w-[13%] font-sans">{t.rate}</th>
                <th className="border border-zinc-400 px-3 py-1.5 text-right w-[15%] font-sans">{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="h-9">
                  <td className="border border-zinc-400 px-2 py-1 text-center font-sans">{index + 1}</td>
                  <td className="border border-zinc-400 px-3 py-1 whitespace-pre-line text-left leading-tight">
                    {item.description}
                  </td>
                  <td className="border border-zinc-400 px-2 py-1 text-right font-sans">{item.quantity}</td>
                  <td className="border border-zinc-400 px-2 py-1 text-right font-sans">{formatNumber(item.unit_price)}</td>
                  <td className="border border-zinc-400 px-3 py-1 text-right font-bold font-sans">
                    {formatNumber(item.total)}
                  </td>
                </tr>
              ))}
              {/* Padding empty rows to maintain layout spacing */}
              {items.length < 5 &&
                Array.from({ length: 5 - items.length }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-8">
                    <td className="border border-zinc-400 px-2 py-1"></td>
                    <td className="border border-zinc-400 px-3 py-1"></td>
                    <td className="border border-zinc-400 px-2 py-1"></td>
                    <td className="border border-zinc-400 px-2 py-1"></td>
                    <td className="border border-zinc-400 px-3 py-1"></td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Amount In Words & Totals */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-3">
              <div className="text-xs italic bg-zinc-100 p-2 border border-zinc-300 rounded leading-relaxed">
                <span className="font-bold font-serif not-italic">{t.amountInWords}: </span>
                {invoice.amount_in_words || amountToWords(invoice.paid + invoice.due, language)}
              </div>
              <div className="flex gap-4 items-center">
                <QRCodeSVG value={`Invoice:${invoice.invoice_number};Shop:${shop.name};Total:${invoice.paid + invoice.due}`} size={50} />
                <BarcodeSVG value={invoice.invoice_number} />
              </div>
            </div>
            
            <div className="col-span-2 text-sm font-sans space-y-1">
              <div className="flex justify-between border-b border-zinc-300 pb-0.5 px-2">
                <span>{t.subtotal}:</span>
                <span className="font-bold">{formatNumber(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between border-b border-zinc-300 pb-0.5 px-2 text-zinc-700">
                  <span>{t.discount}:</span>
                  <span>- {formatNumber(invoice.discount)}</span>
                </div>
              )}
              {invoice.vat > 0 && (
                <div className="flex justify-between border-b border-zinc-300 pb-0.5 px-2 text-zinc-700">
                  <span>{t.vat} ({invoice.vat}%):</span>
                  <span>+ {formatNumber((invoice.subtotal - invoice.discount) * (invoice.vat / 100))}</span>
                </div>
              )}
              {invoice.advance > 0 && (
                <div className="flex justify-between border-b border-zinc-300 pb-0.5 px-2 text-zinc-700">
                  <span>{t.advance}:</span>
                  <span>- {formatNumber(invoice.advance)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-zinc-300 pb-0.5 bg-zinc-100 px-2 py-0.5 font-bold rounded">
                <span>{t.paid}:</span>
                <span className="text-green-800">{formatNumber(invoice.paid)}</span>
              </div>
              <div className="flex justify-between border-b-2 border-double border-zinc-400 bg-red-50 px-2 py-0.5 font-bold text-red-900 rounded">
                <span>{t.due}:</span>
                <span>{formatNumber(invoice.due)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer and Signatures */}
        <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 flex flex-col justify-end space-y-8">
          <div className="flex justify-between items-end px-4">
            <div className="flex flex-col items-center">
              {invoice.customer_signature ? (
                <img src={invoice.customer_signature} alt="Cust Sign" className="h-10 max-w-[120px] object-contain mb-1" />
              ) : (
                <div className="h-10" />
              )}
              <div className="border-t border-zinc-400 w-36 text-center text-xs pt-1 text-zinc-700">
                {t.customerSignature}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              {invoice.authorized_signature ? (
                <img src={invoice.authorized_signature} alt="Auth Sign" className="h-10 max-w-[120px] object-contain mb-1" />
              ) : (
                <div className="h-10" />
              )}
              <div className="border-t border-zinc-400 w-36 text-center text-xs pt-1 text-zinc-700">
                {t.authorizedSignature}
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-500 font-sans leading-none pt-2">
            {shop.footer_text || "Thank you for your business!"}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 2: Corporate Invoice (Navy Dark Blue Accent)
  // ----------------------------------------------------
  if (invoice.template_id === 2) {
    return (
      <div className="relative w-full h-full p-8 font-sans text-zinc-900 bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {/* Watermark logo or shop name */}
        <div style={{ ...watermarkStyle, color: "#0B3954", opacity: 0.04 }}>
          {shop.name ? shop.name.toUpperCase() : "CORPORATE"}
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt="Logo" className="h-12 w-auto object-contain max-w-[200px]" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#0B3954] flex items-center justify-center text-white font-bold text-lg">
                    {shop.name ? shop.name[0] : "C"}
                  </div>
                  <h1 className="text-2xl font-bold text-[#0B3954] tracking-tight">{shop.name || "Corporate Press"}</h1>
                </div>
              )}
              <p className="text-[11px] text-zinc-500 max-w-[280px]">
                {shop.address || "Dhaka, Bangladesh"}
              </p>
              <p className="text-[11px] text-zinc-500">
                {t.mobile}: {shop.mobile || "+880"} | {shop.email || ""}
              </p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-3xl font-extrabold text-[#0B3954] uppercase tracking-wider">{t.invoice}</h2>
              <div className="text-xs space-y-0.5">
                <p><span className="font-semibold text-zinc-500">{t.invoiceNo}:</span> <span className="font-mono font-bold text-zinc-800">{invoice.invoice_number}</span></p>
                <p><span className="font-semibold text-zinc-500">{t.date}:</span> <span className="text-zinc-800">{formatDateString(invoice.date)}</span></p>
                <p><span className="font-semibold text-zinc-500">Status:</span> <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] uppercase ${getStatusColor(invoice.status)}`}>{invoice.status}</span></p>
              </div>
            </div>
          </div>

          <hr className="border-t border-zinc-200" />

          {/* Customer Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#0B3954]/5 border-l-4 border-[#0B3954] rounded-r">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B3954] mb-1.5">{t.customerInfo}</h3>
              <p className="font-bold text-sm text-zinc-800">{customer.name || "Client Name"}</p>
              {customer.address && <p className="text-xs text-zinc-600 mt-0.5">{customer.address}</p>}
              {customer.mobile && <p className="text-xs text-zinc-500 mt-1 font-mono">{t.mobile}: {customer.mobile}</p>}
            </div>
            
            <div className="flex flex-col justify-end items-end gap-1.5 text-xs text-zinc-600">
              {shop.website && <p><span className="font-semibold">Web:</span> {shop.website}</p>}
              {shop.facebook && <p><span className="font-semibold">{t.facebook}:</span> {shop.facebook}</p>
              }
              {shop.bin && <p><span className="font-semibold">{t.bin}:</span> {shop.bin}</p>}
              {shop.tin && <p><span className="font-semibold">{t.tin}:</span> {shop.tin}</p>}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#0B3954] text-white">
                <th className="px-3 py-2.5 rounded-l w-[6%]">{t.sl}</th>
                <th className="px-3 py-2.5 w-[54%]">{t.description}</th>
                <th className="px-3 py-2.5 text-right w-[12%]">{t.qty}</th>
                <th className="px-3 py-2.5 text-right w-[13%]">{t.rate}</th>
                <th className="px-3 py-2.5 text-right rounded-r w-[15%]">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-3 py-2 text-zinc-500 font-mono">{index + 1}</td>
                  <td className="px-3 py-2 font-medium text-zinc-800 whitespace-pre-line leading-relaxed">
                    {item.description}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-600 font-mono">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-zinc-600 font-mono">{formatNumber(item.unit_price)}</td>
                  <td className="px-3 py-2 text-right font-bold text-zinc-950 font-mono">{formatNumber(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="grid grid-cols-5 gap-6 pt-4">
            <div className="col-span-3 space-y-4">
              <div className="text-[11px] leading-relaxed text-zinc-500 bg-zinc-50 p-2.5 rounded border border-zinc-200">
                <strong className="text-zinc-700 uppercase tracking-wide text-[9px] block mb-0.5">{t.amountInWords}:</strong>
                {invoice.amount_in_words || amountToWords(invoice.paid + invoice.due, language)}
              </div>
              <div className="flex gap-4 items-center">
                <QRCodeSVG value={`Invoice:${invoice.invoice_number};Amount:${invoice.paid + invoice.due}`} size={45} />
                <BarcodeSVG value={invoice.invoice_number} />
              </div>
            </div>
            
            <div className="col-span-2 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                <span>{t.subtotal}:</span>
                <span className="font-semibold font-mono text-zinc-800">{formatNumber(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                  <span>{t.discount}:</span>
                  <span className="font-semibold font-mono text-zinc-800">- {formatNumber(invoice.discount)}</span>
                </div>
              )}
              {invoice.vat > 0 && (
                <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                  <span>{t.vat} ({invoice.vat}%):</span>
                  <span className="font-semibold font-mono text-zinc-800">+ {formatNumber((invoice.subtotal - invoice.discount) * (invoice.vat / 100))}</span>
                </div>
              )}
              {invoice.advance > 0 && (
                <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                  <span>{t.advance}:</span>
                  <span className="font-semibold font-mono text-zinc-800">- {formatNumber(invoice.advance)}</span>
                </div>
              )}
              <hr className="border-t border-zinc-200 my-1 mx-2" />
              <div className="flex justify-between font-bold text-[#0B3954] bg-[#0B3954]/5 px-2 py-1 rounded">
                <span>{t.paid}:</span>
                <span className="font-mono">{formatNumber(invoice.paid)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                <span>{t.due}:</span>
                <span className="font-mono">{formatNumber(invoice.due)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer and Signatures */}
        <div className="mt-8 pt-4 border-t border-zinc-200">
          <div className="flex justify-between items-end px-4 mb-4">
            <div className="text-center">
              {invoice.customer_signature ? (
                <img src={invoice.customer_signature} alt="Signature" className="h-10 max-w-[120px] object-contain mx-auto mb-1" />
              ) : (
                <div className="h-10" />
              )}
              <p className="border-t border-zinc-300 w-36 text-[10px] text-zinc-500 pt-1 uppercase tracking-wider">{t.customerSignature}</p>
            </div>
            <div className="text-center">
              {invoice.authorized_signature ? (
                <img src={invoice.authorized_signature} alt="Signature" className="h-10 max-w-[120px] object-contain mx-auto mb-1" />
              ) : (
                <div className="h-10" />
              )}
              <p className="border-t border-zinc-300 w-36 text-[10px] text-[#0B3954] pt-1 font-bold uppercase tracking-wider">{t.authorizedSignature}</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-400">
            {shop.footer_text || "Thank you for printing with us! Visit again."}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 3: Printing Press Invoice (Vintage Offset Style)
  // ----------------------------------------------------
  if (invoice.template_id === 3) {
    return (
      <div className="relative w-full h-full p-8 font-sans text-zinc-950 bg-[#E2F0D9]/30 border-2 border-emerald-800/40 rounded shadow-inner overflow-hidden flex flex-col justify-between">
        <div style={{ ...watermarkStyle, color: "#065f46" }}>
          {shop.name ? shop.name.toUpperCase() : "PRINT PRESS"}
        </div>

        <div className="relative z-10 space-y-4">
          <div className="text-center text-[11px] font-medium tracking-widest text-emerald-900 italic border-b border-emerald-900/10 pb-1.5 uppercase">
            * {t.bismillah} *
          </div>

          <div className="flex justify-between items-end pb-3">
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-900 tracking-wide uppercase">
                {shop.name || "Classic Press"}
              </h1>
              <p className="text-[11px] font-medium text-emerald-800/80">{shop.category || "Book Binding, Color & Packaging Prints"}</p>
              <p className="text-xs text-zinc-700 mt-1">{shop.address || "Nilkhet, Dhaka"}</p>
              <p className="text-xs text-zinc-700">{t.mobile}: {shop.mobile || "+880"}</p>
            </div>
            
            <div className="text-right space-y-1">
              <span className="inline-block border-2 border-emerald-800 text-emerald-800 font-extrabold px-3 py-0.5 rounded text-xs tracking-wider uppercase mb-1">
                {t.bill} / {t.challan}
              </span>
              <p className="text-xs font-medium"><span className="text-zinc-600">{t.invoiceNo}:</span> <span className="font-mono font-bold">{invoice.invoice_number}</span></p>
              <p className="text-xs font-medium"><span className="text-zinc-600">{t.date}:</span> <span className="font-mono">{formatDateString(invoice.date)}</span></p>
            </div>
          </div>

          <div className="border border-emerald-800/20 p-3 rounded bg-emerald-50/50 space-y-1.5 text-xs">
            <div className="flex"><span className="font-bold min-w-[80px]">{t.name}:</span><span className="flex-1 border-b border-emerald-800/20 font-medium">{customer.name || "Customer Name"}</span></div>
            <div className="flex"><span className="font-bold min-w-[80px]">{t.address}:</span><span className="flex-1 border-b border-emerald-800/20">{customer.address || "N/A"}</span></div>
            <div className="flex"><span className="font-bold min-w-[80px]">{t.mobile}:</span><span className="flex-1 border-b border-emerald-800/20 font-mono">{customer.mobile || "N/A"}</span></div>
          </div>

          {/* Table */}
          <table className="w-full text-xs border border-emerald-800/40">
            <thead>
              <tr className="bg-emerald-800 text-white font-bold">
                <th className="border border-emerald-800/30 px-2 py-1 text-center w-[5%]">{t.sl}</th>
                <th className="border border-emerald-800/30 px-3 py-1 text-left w-[55%]">{t.description}</th>
                <th className="border border-emerald-800/30 px-2 py-1 text-right w-[12%]">{t.qty}</th>
                <th className="border border-emerald-800/30 px-2 py-1 text-right w-[13%]">{t.rate}</th>
                <th className="border border-emerald-800/30 px-3 py-1 text-right w-[15%]">{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="h-8 hover:bg-emerald-50/30">
                  <td className="border border-emerald-800/20 px-2 py-1 text-center font-mono">{idx + 1}</td>
                  <td className="border border-emerald-800/20 px-3 py-1 whitespace-pre-line text-left leading-tight font-medium">
                    {item.description}
                  </td>
                  <td className="border border-emerald-800/20 px-2 py-1 text-right font-mono">{item.quantity}</td>
                  <td className="border border-emerald-800/20 px-2 py-1 text-right font-mono">{formatNumber(item.unit_price)}</td>
                  <td className="border border-emerald-800/20 px-3 py-1 text-right font-bold font-mono">{formatNumber(item.total)}</td>
                </tr>
              ))}
              {items.length < 5 &&
                Array.from({ length: 5 - items.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-8">
                    <td className="border border-emerald-800/10 px-2 py-1"></td>
                    <td className="border border-emerald-800/10 px-3 py-1"></td>
                    <td className="border border-emerald-800/10 px-2 py-1"></td>
                    <td className="border border-emerald-800/10 px-2 py-1"></td>
                    <td className="border border-emerald-800/10 px-3 py-1"></td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Amount and Totals */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-3">
              <p className="text-[11px] leading-relaxed bg-emerald-50/40 border border-emerald-800/20 p-2 rounded">
                <span className="font-bold">{t.amountInWords}:</span> {invoice.amount_in_words || amountToWords(invoice.paid + invoice.due, language)}
              </p>
              <div className="flex gap-4 items-center">
                <QRCodeSVG value={`Inv:${invoice.invoice_number};Shop:${shop.name}`} size={45} />
                <BarcodeSVG value={invoice.invoice_number} />
              </div>
            </div>
            
            <div className="col-span-2 text-xs space-y-1">
              <div className="flex justify-between border-b border-emerald-800/10 px-2 py-0.5">
                <span>{t.subtotal}:</span>
                <span className="font-mono">{formatNumber(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between border-b border-emerald-800/10 px-2 py-0.5">
                  <span>{t.discount}:</span>
                  <span className="font-mono">- {formatNumber(invoice.discount)}</span>
                </div>
              )}
              {invoice.vat > 0 && (
                <div className="flex justify-between border-b border-emerald-800/10 px-2 py-0.5">
                  <span>{t.vat} ({invoice.vat}%):</span>
                  <span className="font-mono">+ {formatNumber((invoice.subtotal - invoice.discount) * (invoice.vat / 100))}</span>
                </div>
              )}
              {invoice.advance > 0 && (
                <div className="flex justify-between border-b border-emerald-800/10 px-2 py-0.5">
                  <span>{t.advance}:</span>
                  <span className="font-mono">- {formatNumber(invoice.advance)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold bg-emerald-800/10 px-2 py-1 rounded">
                <span>{t.paid}:</span>
                <span className="font-mono text-emerald-900">{formatNumber(invoice.paid)}</span>
              </div>
              <div className="flex justify-between font-bold bg-red-100 px-2 py-1 rounded text-red-950">
                <span>{t.due}:</span>
                <span className="font-mono">{formatNumber(invoice.due)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-6 pt-4 border-t border-dashed border-emerald-800/20">
          <div className="flex justify-between px-6 mb-4">
            <div className="text-center">
              {invoice.customer_signature ? (
                <img src={invoice.customer_signature} alt="Customer Sign" className="h-8 max-w-[120px] object-contain mx-auto mb-1" />
              ) : (
                <div className="h-8" />
              )}
              <p className="border-t border-zinc-400 w-32 text-[10px] text-zinc-600 pt-0.5">{t.customerSignature}</p>
            </div>
            <div className="text-center">
              {invoice.authorized_signature ? (
                <img src={invoice.authorized_signature} alt="Auth Sign" className="h-8 max-w-[120px] object-contain mx-auto mb-1" />
              ) : (
                <div className="h-8" />
              )}
              <p className="border-t border-zinc-400 w-32 text-[10px] text-emerald-950 font-bold pt-0.5">{t.authorizedSignature}</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-500">
            {shop.footer_text || "Printed materials once cut or laminated cannot be returned."}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 4: Colorful Receipt (Sky Blue & Orange Highlights)
  // ----------------------------------------------------
  if (invoice.template_id === 4) {
    return (
      <div className="relative w-full h-full p-8 font-sans text-zinc-900 bg-white border border-zinc-200 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between">
        <div style={{ ...watermarkStyle, color: "#38bdf8", opacity: 0.05 }}>
          {shop.name ? shop.name.toUpperCase() : "RECEIPT"}
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt="Logo" className="h-14 w-auto object-contain max-w-[150px]" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-400 to-[#F4A300] flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                  {shop.name ? shop.name[0] : "P"}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-sky-950 tracking-tight bg-gradient-to-r from-sky-600 to-[#F4A300] bg-clip-text text-transparent">
                  {shop.name || "Modern Press"}
                </h1>
                <p className="text-[11px] text-zinc-500 font-medium">{shop.category || "Offset Printing & Corporate Branding"}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="inline-block bg-[#F4A300] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-sm">
                {t.receipt}
              </span>
              <p className="text-xs font-mono font-bold text-zinc-800">{invoice.invoice_number}</p>
              <p className="text-[11px] text-zinc-500">{formatDateString(invoice.date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-sky-50/50 p-4 rounded-xl border border-sky-100/50 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-sky-900 tracking-wide uppercase text-[9px]">{t.customerInfo}</p>
              <p className="font-bold text-zinc-800 text-sm">{customer.name || "Valued Customer"}</p>
              <p className="text-zinc-500">{customer.address || "Address N/A"}</p>
              <p className="text-zinc-600 font-mono">{customer.mobile}</p>
            </div>
            
            <div className="space-y-1 border-l border-sky-200/50 pl-4">
              <p className="font-bold text-[#F4A300] tracking-wide uppercase text-[9px]">Contact Info</p>
              <p className="text-zinc-700"><span className="font-semibold">Mob:</span> {shop.mobile}</p>
              <p className="text-zinc-700"><span className="font-semibold">Web:</span> {shop.website || "N/A"}</p>
              {shop.facebook && <p className="text-zinc-700 max-w-[150px] truncate"><span className="font-semibold">FB:</span> {shop.facebook}</p>}
            </div>

            <div className="space-y-1 border-l border-sky-200/50 pl-4 flex flex-col justify-between items-end">
              <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase border ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
              {shop.bin && <p className="text-[10px] text-zinc-500 font-mono">BIN: {shop.bin}</p>}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-sky-500 text-white rounded-lg">
                <th className="px-3 py-2.5 rounded-l-lg w-[6%]">{t.sl}</th>
                <th className="px-3 py-2.5 w-[54%]">{t.description}</th>
                <th className="px-3 py-2.5 text-right w-[12%]">{t.qty}</th>
                <th className="px-3 py-2.5 text-right w-[13%]">{t.rate}</th>
                <th className="px-3 py-2.5 text-right rounded-r-lg w-[15%]">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-zinc-50/50">
                  <td className="px-3 py-2 text-zinc-400 font-semibold font-mono">{index + 1}</td>
                  <td className="px-3 py-2 font-medium text-zinc-800 whitespace-pre-line leading-relaxed">
                    {item.description}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-600 font-mono">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-zinc-600 font-mono">{formatNumber(item.unit_price)}</td>
                  <td className="px-3 py-2 text-right font-bold text-sky-950 font-mono">{formatNumber(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="grid grid-cols-5 gap-6 pt-2">
            <div className="col-span-3 space-y-4">
              <div className="text-[10px] leading-relaxed text-zinc-600 bg-[#FFF2CC]/30 border border-[#FFF2CC] p-2.5 rounded-xl">
                <span className="font-extrabold text-[#F4A300] text-[9px] uppercase tracking-wider block mb-0.5">{t.amountInWords}:</span>
                {invoice.amount_in_words || amountToWords(invoice.paid + invoice.due, language)}
              </div>
              <div className="flex gap-4 items-center">
                <QRCodeSVG value={`Receipt:${invoice.invoice_number};Amount:${invoice.paid}`} size={45} />
                <BarcodeSVG value={invoice.invoice_number} />
              </div>
            </div>
            
            <div className="col-span-2 space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                <span>{t.subtotal}:</span>
                <span className="font-mono text-zinc-800">{formatNumber(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                  <span>{t.discount}:</span>
                  <span className="font-mono text-zinc-800">- {formatNumber(invoice.discount)}</span>
                </div>
              )}
              {invoice.vat > 0 && (
                <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                  <span>{t.vat}:</span>
                  <span className="font-mono text-zinc-800">+ {formatNumber((invoice.subtotal - invoice.discount) * (invoice.vat / 100))}</span>
                </div>
              )}
              {invoice.advance > 0 && (
                <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                  <span>{t.advance}:</span>
                  <span className="font-mono text-zinc-800">- {formatNumber(invoice.advance)}</span>
                </div>
              )}
              <hr className="border-t border-zinc-200 my-1 mx-2" />
              <div className="flex justify-between font-bold text-sky-800 bg-sky-50 px-2 py-1 rounded-lg">
                <span>{t.paid}:</span>
                <span className="font-mono">{formatNumber(invoice.paid)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                <span>{t.due}:</span>
                <span className="font-mono">{formatNumber(invoice.due)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-zinc-150">
          <div className="flex justify-between px-6 mb-4">
            <div className="text-center">
              {invoice.customer_signature ? (
                <img src={invoice.customer_signature} alt="Cust Sign" className="h-8 max-w-[120px] object-contain mx-auto mb-1" />
              ) : (
                <div className="h-8" />
              )}
              <p className="border-t border-zinc-200 w-32 text-[10px] text-zinc-400 pt-0.5">{t.customerSignature}</p>
            </div>
            <div className="text-center">
              {invoice.authorized_signature ? (
                <img src={invoice.authorized_signature} alt="Auth Sign" className="h-8 max-w-[120px] object-contain mx-auto mb-1" />
              ) : (
                <div className="h-8" />
              )}
              <p className="border-t border-zinc-200 w-32 text-[10px] text-sky-600 font-bold pt-0.5">{t.authorizedSignature}</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-400">
            {shop.footer_text || "Thank you. Quality prints, design, & services."}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 6: IT Mart Style Invoice (Geometric Teal/Green)
  // ----------------------------------------------------
  if (invoice.template_id === 6) {
    const totalVal = invoice.subtotal - invoice.discount + (invoice.subtotal - invoice.discount) * (invoice.vat / 100);
    return (
      <div className="relative w-full h-full p-8 pt-20 pb-16 font-sans text-zinc-800 bg-white shadow-sm overflow-hidden flex flex-col justify-between select-none" style={{ minHeight: '297mm', fontFamily: 'var(--font-outfit), sans-serif' }}>
        {/* Top Geometric Banner */}
        <div className="absolute top-0 left-0 right-0 h-28 overflow-hidden z-0">
          <svg width="100%" height="100%" viewBox="0 0 800 120" preserveAspectRatio="none" className="w-full h-full">
            {/* Bright Teal overlap */}
            <path d="M0,0 L550,0 L420,80 L0,120 Z" fill="#0ba595" />
            {/* Dark Green main */}
            <path d="M380,0 L800,0 L800,120 L420,80 Z" fill="#0f5a54" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header / Logo Section */}
            <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
              {/* Shop Logo & Name */}
              <div className="flex flex-col items-start gap-1">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt="Logo" className="h-12 w-auto object-contain max-w-[180px] mb-1" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0ba595] to-[#0f5a54] flex items-center justify-center text-white font-extrabold text-xl shadow">
                      {shop.name ? shop.name[0] : "I"}
                    </div>
                    <span className="text-xl font-black text-[#0f5a54] uppercase tracking-wider">{shop.name || "IT Mart"}</span>
                  </div>
                )}
                {shop.category && (
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                    {shop.category}
                  </span>
                )}
              </div>

              {/* Invoice Text & Number */}
              <div className="text-right">
                <h1 className="text-4xl font-black text-[#0f5a54] tracking-wider uppercase leading-none">
                  {t.invoice}
                </h1>
                <p className="text-xs font-bold text-zinc-700 mt-2 font-mono tracking-widest uppercase">
                  {invoice.invoice_number}
                </p>
              </div>
            </div>

            {/* Customer Details & Grand Value Box */}
            <div className="grid grid-cols-12 gap-4 items-start pt-2">
              {/* Billing Info */}
              <div className="col-span-7 space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0f5a54] tracking-wide uppercase mb-1">
                    {t.customerInfo} :
                  </h3>
                  <div className="text-xs space-y-1 text-zinc-700">
                    <p><span className="font-semibold text-zinc-500">{t.name}:</span> <span className="text-zinc-900 font-bold">{customer.name || "Valued Client"}</span></p>
                    {customer.email && <p><span className="font-semibold text-zinc-500">Email:</span> <span className="text-[#0ba595] font-medium">{customer.email}</span></p>}
                    {customer.mobile && <p><span className="font-semibold text-zinc-500">Phone:</span> <span className="font-mono text-zinc-900">{customer.mobile}</span></p>}
                    {customer.address && <p><span className="font-semibold text-zinc-500">Address:</span> <span className="text-zinc-800">{customer.address}</span></p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#0f5a54] tracking-wide uppercase mb-0.5">
                    Date Invoice :
                  </h3>
                  <p className="text-xs text-zinc-700 font-semibold">{formatDateString(invoice.date)}</p>
                </div>
              </div>

              {/* VALUE Large Display Box */}
              <div className="col-span-5 text-right space-y-2">
                <div className="text-2xl sm:text-3xl font-black text-[#0f5a54] tracking-tight uppercase">
                  {t.value}: {formatNumber(totalVal)}/-
                </div>
                <p className="text-xs text-zinc-500 italic max-w-xs ml-auto leading-normal whitespace-pre-line bg-zinc-50 p-2 border border-zinc-100 rounded-xl">
                  {invoice.notes || "Balance due for digital product service"}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden border border-zinc-200 rounded-xl">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f5a54] text-white font-extrabold text-left uppercase">
                    <th className="px-4 py-3 w-[55%]">{t.description}</th>
                    <th className="px-3 py-3 text-center w-[15%]">{t.validity}</th>
                    <th className="px-3 py-3 text-center w-[10%]">{t.qty}</th>
                    <th className="px-3 py-3 text-right w-[10%]">{t.rate}</th>
                    <th className="px-4 py-3 text-right w-[10%]">{t.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3 font-medium text-zinc-800 leading-normal whitespace-pre-line">
                        {item.description}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-[#0ba595]">
                        {item.validity || "—"}
                      </td>
                      <td className="px-3 py-3 text-center text-zinc-600 font-mono">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3 text-right text-zinc-600 font-mono">
                        {formatNumber(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-950 font-mono">
                        {formatNumber(item.total)}
                      </td>
                    </tr>
                  ))}
                  {/* Padding empty rows to maintain layout spacing */}
                  {items.length < 4 &&
                    Array.from({ length: 4 - items.length }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-10">
                        <td className="px-4 py-3"></td>
                        <td className="px-3 py-3"></td>
                        <td className="px-3 py-3"></td>
                        <td className="px-3 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer calculations & payment details layout */}
            <div className="grid grid-cols-12 gap-6 pt-2 items-start">
              {/* Payment Method Details */}
              <div className="col-span-7 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-extrabold text-[#0f5a54] uppercase tracking-wider">
                    {t.paymentMethod} :
                  </h3>
                  <p className="text-xs font-bold text-[#0f5a54] bg-[#0f5a54]/5 px-3 py-2 rounded-xl border border-[#0f5a54]/20 inline-block font-sans">
                    {invoice.payment_method || "Bkash: 01716607988 (send Money)"}
                  </p>
                </div>

                {/* Term & Conditions */}
                <div className="space-y-1">
                  <h3 className="text-xs font-extrabold text-[#0f5a54] uppercase tracking-wider">
                    {t.terms} :
                  </h3>
                  <ul className="text-[10px] text-zinc-500 list-disc list-inside space-y-0.5 leading-normal">
                    <li>Activation completed successfully as per order.</li>
                    <li>No refund after successful delivery.</li>
                    <li>Support available during validity period.</li>
                  </ul>
                </div>
              </div>

              {/* Summary Calculations table */}
              <div className="col-span-5 space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-zinc-150 py-1.5 px-1 font-semibold text-zinc-500">
                  <span>{t.subtotal}</span>
                  <span className="font-mono text-zinc-800">{formatNumber(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between border-b border-zinc-150 py-1.5 px-1 font-semibold text-zinc-500">
                    <span>{t.discount}</span>
                    <span className="font-mono text-zinc-800">- {formatNumber(invoice.discount)}</span>
                  </div>
                )}
                {invoice.vat > 0 && (
                  <div className="flex justify-between border-b border-zinc-150 py-1.5 px-1 font-semibold text-zinc-500">
                    <span>{t.vat} ({invoice.vat}%)</span>
                    <span className="font-mono text-zinc-800">+ {formatNumber((invoice.subtotal - invoice.discount) * (invoice.vat / 100))}</span>
                  </div>
                )}
                {invoice.advance > 0 && (
                  <div className="flex justify-between border-b border-zinc-150 py-1.5 px-1 font-semibold text-[#0ba595]">
                    <span>{t.advance}</span>
                    <span className="font-mono text-zinc-800">- {formatNumber(invoice.advance)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2.5 px-3 bg-[#0f5a54]/5 rounded-xl text-sm font-black text-[#0f5a54]">
                  <span>{t.total}</span>
                  <span className="font-mono text-base">{formatNumber(totalVal - invoice.advance - invoice.paid)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Bottom Decorator */}
          <div className="space-y-6 pt-6">
            {/* Signature Pad render */}
            <div className="flex justify-between items-end px-4">
              <div className="text-center">
                {invoice.authorized_signature ? (
                  <div className="space-y-1">
                    <img src={invoice.authorized_signature} alt="Signature" className="h-10 max-w-[140px] object-contain mx-auto" />
                    <div className="w-40 border-t border-zinc-300 mx-auto" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pt-1 leading-none">
                      {t.manager} ({shop.name || "IT Mart"})
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="h-10 flex items-end justify-center">
                      <span className="font-serif italic text-lg text-zinc-400 font-medium pb-1">gofur</span>
                    </div>
                    <div className="w-40 border-t border-zinc-300 mx-auto" />
                    <p className="text-[10px] font-bold text-[#0f5a54] uppercase tracking-wider pt-1 leading-none">
                      {t.manager} ({shop.name || "IT Mart"})
                    </p>
                  </div>
                )}
              </div>

              {/* QR and Barcode indicators */}
              <div className="flex items-center gap-3">
                <QRCodeSVG value={`Invoice:${invoice.invoice_number};Amount:${invoice.paid}`} size={35} />
                <BarcodeSVG value={invoice.invoice_number} />
              </div>
            </div>

            {/* Bottom shop footer text */}
            <p className="text-center text-[9px] text-zinc-400 tracking-wider">
              {shop.footer_text || "Thank you. Quality prints, design, & services."}
            </p>
          </div>
        </div>

        {/* Bottom Geometric Banner */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden z-0">
          <svg width="100%" height="100%" viewBox="0 0 800 80" preserveAspectRatio="none" className="w-full h-full">
            {/* Dark green base */}
            <path d="M0,80 L800,80 L800,0 L420,40 Z" fill="#0f5a54" />
            {/* Bright teal layer */}
            <path d="M0,80 L380,40 L800,80 Z" fill="#0ba595" />
          </svg>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 5: Minimal Modern Invoice (Monochrome High Contrast)
  // ----------------------------------------------------
  return (
    <div className="relative w-full h-full p-8 font-sans text-zinc-900 bg-white border border-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-950">
              {shop.name || "Minimal Agency"}
            </h1>
            <p className="text-xs text-zinc-500 font-medium">{shop.category}</p>
            <p className="text-xs text-zinc-600 max-w-[300px]">{shop.address}</p>
            <p className="text-xs text-zinc-600 font-mono">{shop.mobile}</p>
          </div>
          
          <div className="text-right space-y-1">
            <h2 className="text-2xl font-light uppercase tracking-widest text-zinc-500">{t.invoice}</h2>
            <p className="text-xs font-mono font-bold">{invoice.invoice_number}</p>
            <p className="text-[11px] text-zinc-500">{formatDateString(invoice.date)}</p>
            <span className="inline-block border border-zinc-900 text-zinc-900 font-black px-2 py-0.5 text-[9px] uppercase tracking-wider rounded">
              {invoice.status}
            </span>
          </div>
        </div>

        <hr className="border-t border-zinc-900" />

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{t.customerInfo}</p>
            <p className="font-bold text-zinc-900 text-sm">{customer.name || "Customer Name"}</p>
            <p className="text-zinc-600 mt-0.5">{customer.address}</p>
            <p className="text-zinc-600 font-mono mt-0.5">{customer.mobile}</p>
          </div>
          
          <div className="flex flex-col items-end justify-between text-right text-[11px] text-zinc-600">
            <div>
              {shop.bin && <p><span className="font-semibold uppercase text-[9px] text-zinc-400">BIN:</span> {shop.bin}</p>}
              {shop.tin && <p><span className="font-semibold uppercase text-[9px] text-zinc-400">TIN:</span> {shop.tin}</p>}
              {shop.email && <p>{shop.email}</p>}
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs text-left border-collapse border-b border-zinc-900">
          <thead>
            <tr className="border-b border-zinc-950 font-bold uppercase text-zinc-950 text-[10px]">
              <th className="py-2.5 w-[6%]">{t.sl}</th>
              <th className="py-2.5 w-[54%]">{t.description}</th>
              <th className="py-2.5 text-right w-[12%]">{t.qty}</th>
              <th className="py-2.5 text-right w-[13%]">{t.rate}</th>
              <th className="py-2.5 text-right w-[15%]">{t.total}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="py-2.5 text-zinc-400 font-mono">{index + 1}</td>
                <td className="py-2.5 font-medium text-zinc-800 whitespace-pre-line leading-relaxed">
                  {item.description}
                </td>
                <td className="py-2.5 text-right text-zinc-600 font-mono">{item.quantity}</td>
                <td className="py-2.5 text-right text-zinc-600 font-mono">{formatNumber(item.unit_price)}</td>
                <td className="py-2.5 text-right font-bold text-zinc-950 font-mono">{formatNumber(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="grid grid-cols-5 gap-6 pt-2">
          <div className="col-span-3 space-y-4">
            <p className="text-[10px] leading-relaxed text-zinc-500 border border-zinc-200 p-2.5 rounded">
              <span className="font-bold text-zinc-800 uppercase tracking-widest text-[8px] block mb-0.5">{t.amountInWords}:</span>
              {invoice.amount_in_words || amountToWords(invoice.paid + invoice.due, language)}
            </p>
            <div className="flex gap-4 items-center">
              <QRCodeSVG value={`Invoice:${invoice.invoice_number};Amount:${invoice.paid}`} size={40} />
              <BarcodeSVG value={invoice.invoice_number} />
            </div>
          </div>
          
          <div className="col-span-2 space-y-1.5 text-xs font-medium">
            <div className="flex justify-between text-zinc-500 px-2 py-0.5">
              <span>{t.subtotal}:</span>
              <span className="font-mono text-zinc-800">{formatNumber(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                <span>{t.discount}:</span>
                <span className="font-mono text-zinc-800">- {formatNumber(invoice.discount)}</span>
              </div>
            )}
            {invoice.vat > 0 && (
              <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                <span>{t.vat} ({invoice.vat}%):</span>
                <span className="font-mono text-zinc-800">+ {formatNumber((invoice.subtotal - invoice.discount) * (invoice.vat / 100))}</span>
              </div>
            )}
            {invoice.advance > 0 && (
              <div className="flex justify-between text-zinc-500 px-2 py-0.5">
                <span>{t.advance}:</span>
                <span className="font-mono text-zinc-800">- {formatNumber(invoice.advance)}</span>
              </div>
            )}
            <hr className="border-t border-zinc-200 my-1 mx-2" />
            <div className="flex justify-between font-bold text-zinc-950 px-2 py-1 rounded">
              <span>{t.paid}:</span>
              <span className="font-mono">{formatNumber(invoice.paid)}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-950 bg-zinc-100 px-2 py-1 rounded">
              <span>{t.due}:</span>
              <span className="font-mono">{formatNumber(invoice.due)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-zinc-200">
        <div className="flex justify-between px-6 mb-4">
          <div className="text-center">
            {invoice.customer_signature ? (
              <img src={invoice.customer_signature} alt="Cust Sign" className="h-8 max-w-[120px] object-contain mx-auto mb-1" />
            ) : (
              <div className="h-8" />
            )}
            <p className="border-t border-zinc-300 w-32 text-[9px] text-zinc-400 pt-0.5 uppercase tracking-widest">{t.customerSignature}</p>
          </div>
          <div className="text-center">
            {invoice.authorized_signature ? (
              <img src={invoice.authorized_signature} alt="Auth Sign" className="h-8 max-w-[120px] object-contain mx-auto mb-1" />
            ) : (
              <div className="h-8" />
            )}
            <p className="border-t border-zinc-300 w-32 text-[9px] text-zinc-950 font-bold pt-0.5 uppercase tracking-widest">{t.authorizedSignature}</p>
          </div>
        </div>
        <p className="text-center text-[9px] text-zinc-400 tracking-wider">
          {shop.footer_text || "Thank you."}
        </p>
      </div>
    </div>
  );
}
