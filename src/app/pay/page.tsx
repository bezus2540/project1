"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart"; // ⬅️ ดึงรายการจากตะกร้า

type PayMethod = "card" | "promptpay";

const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export default function Page() {
  const router = useRouter();
  const { items } = useCart(); //  รายการในตะกร้า

  const [method, setMethod] = useState<PayMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  // คำนวณจาก items ในตะกร้า
  const { subTotal, vat7, grandTotal } = useMemo(() => {
    const sub = items.reduce((s, it) => s + it.qty * it.price, 0);
    const vat = Math.round(sub * 0.07);
    return { subTotal: sub, vat7: vat, grandTotal: sub + vat };
  }, [items]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) {
      alert("ตะกร้าว่าง — เลือกสินค้าอย่างน้อย 1 รายการก่อนชำระเงิน");
      return;
    }
    if (method === "card" && (!cardNumber || !exp || !cvv)) {
      alert("กรอกข้อมูลบัตรให้ครบก่อนนะ");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          card: method === "card" ? { cardNumber, exp, cvv } : undefined,
          items, // ส่งรายการจากตะกร้า
          totals: { subTotal, vat7, grandTotal },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (data?.ok) {
        alert("ชำระเงินสำเร็จ (เดโม่) 🎉");
        setCardNumber(""); setExp(""); setCvv("");
        router.push("/shop");
      } else {
        alert("ชำระเงินไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("ชำระเงินไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: "url(/spu.jpg)" }} // ใส่รูปนี้ใน /public
    >
      <div className="absolute inset-0 bg-black/40" />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-sm tracking-widest text-amber-200">Spukk</div>
            <div className="text-white text-lg font-semibold">Payment</div>
          </div>

          {/* รายการในตะกร้า */}
          <div className="rounded-xl bg-white/10 border border-white/20 p-4 text-white">
            <div className="grid grid-cols-3 text-sm text-white/80 px-2">
              <div>รายการ</div>
              <div className="text-center">จำนวน</div>
              <div className="text-right">ยอดย่อย</div>
            </div>

            <div className="mt-2 space-y-2">
              {items.length ? (
                items.map((it, idx) => (
                  <div
                    key={`${it.id}-${it.size ?? ""}-${idx}`}
                    className="grid grid-cols-3 items-center rounded-lg bg-white/5 px-2 py-2"
                  >
                    <div className="truncate">
                      {it.name}
                      {it.size ? <span className="text-white/70"> (size {it.size})</span> : null}
                    </div>
                    <div className="text-center">{it.qty}</div>
                    <div className="text-right">
                      {formatTHB(it.qty * it.price).replace("฿", "")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-2 py-3 text-center text-white/80">
                  ตะกร้าของคุณยังว่างอยู่ —{" "}
                  <Link href="/cart" className="underline">ไปที่ตะกร้า</Link>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <Row label="ยอดรวม" value={subTotal} />
              <Row label="ภาษี 7%" value={vat7} />
              <div className="border-t border-white/20 pt-2 mt-2 grid grid-cols-2">
                <div className="font-semibold">ชำระทั้งหมด</div>
                <div className="text-right font-bold text-amber-200">
                  {formatTHB(grandTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* วิธีชำระเงิน */}
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="text-white font-semibold mb-2">Credit/Debit Card</div>

            {/* tabs เลือกวิธีจ่าย */}
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`px-3 py-1 rounded-full text-sm ${
                  method === "card"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                บัตรเครดิต/เดบิต
              </button>
              <button
                type="button"
                onClick={() => setMethod("promptpay")}
                className={`px-3 py-1 rounded-full text-sm ${
                  method === "promptpay"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                PromptPay
              </button>
            </div>

            {method === "card" ? (
              <div className="space-y-3">
                <input
                  placeholder="Card Number"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim()
                    )
                  }
                  className="w-full rounded-lg bg-white/90 px-3 py-2 outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM/YY"
                    value={exp}
                    onChange={(e) =>
                      setExp(
                        e.target.value
                          .replace(/[^\d]/g, "")
                          .slice(0, 4)
                          .replace(/(^\d{2})(\d{0,2})/, (_m, a, b) => (b ? `${a}/${b}` : a))
                      )
                    }
                    className="rounded-lg bg-white/90 px-3 py-2 outline-none"
                  />
                  <input
                    placeholder="CVV"
                    inputMode="numeric"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                    className="rounded-lg bg-white/90 px-3 py-2 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 w-full px-4 py-6">
               <div className="bg-white p-4 rounded-xl shadow-lg max-w-[280px] sm:max-w-[320px] w-full">
                <img 
                  src="/ppd.png" 
                  alt="PromptPay" 
                  className="w-full h-auto block mx-auto object-contain" 
                />
               </div>
             </div>
            )}

            <div className="mt-4 grid gap-3">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="rounded-xl bg-amber-300 hover:bg-amber-200 active:scale-[.99] py-3 font-semibold shadow disabled:opacity-60"
              >
                {loading ? "กำลังชำระเงิน…" : "Confirm Payment"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="text-white/70 hover:text-white text-sm"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-2">
      <div className="text-white/80">{label}</div>
      <div className="text-right text-white/90">
        {formatTHB(value).replace("฿", "")}
      </div>
    </div>
  );
}
