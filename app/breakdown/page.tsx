import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatMoney } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { accruedInterest, interestBase, monthlyInterest } from '@/lib/interest';

export const dynamic = 'force-dynamic';

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric' });

const fmtMonth =(d: Date) => d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'long' });

export default async function BreakdownPage({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
  const { member: memberParam } = await searchParams;

  const members = await prisma.user.findMany({
    where: { loans: { some: {} } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const selectedId = Number(memberParam) || members[0]?.id;
  const selected = members.find((m) => m.id === selectedId);

  const [loans, payments] = selected
    ? await Promise.all([
        prisma.loan.findMany({ where: { memberId: selected.id }, orderBy: [{ startDate: 'asc' }, { id: 'asc' }] }),
        prisma.transaction.findMany({ where: { memberId: selected.id, type: 'LOAN_PAYMENT' }, orderBy: { date: 'asc' } }),
      ])
    : [[], []];

  // Interest rules live in lib/interest.ts: simple interest on the original amount, first month free,
  // and the current month accrues by days elapsed until the month-end deadline.
  const now = new Date();
  const first = loans[0];
  const rows = loans.map((l, i) => {
    const { interest, days, daysInMonth } = accruedInterest(l, now);
    return { loan: l, interest, fullInterest: monthlyInterest(l), days, daysInMonth, payable: l.principal + interest, isFirst: i === 0 };
  });
  const base = first ? interestBase(first) : 0;
  const monthsCharged = rows.filter((r) => r.fullInterest > 0).length;

  const active = loans.find((l) => l.status === 'ACTIVE');
  const activeRow = rows.find((r) => r.loan === active);
  const payableNow = activeRow ? activeRow.payable - activeRow.loan.amountPaid : 0;
  const payableOnDue = activeRow ? activeRow.loan.principal + activeRow.fullInterest - activeRow.loan.amountPaid : 0;
  const isPartial = !!activeRow && activeRow.days < activeRow.daysInMonth;
  const totalInterest = first && activeRow ? activeRow.payable - first.principal : 0;

  return (
    <div className="pt-2 pb-20 space-y-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-teal-700">Loan Breakdown</h1>
        <p className="text-sm text-gray-500">How each member&apos;s current payable was computed</p>
      </div>

      {/* Member picker */}
      <div className="flex flex-wrap gap-2 justify-center print:hidden">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/breakdown?member=${m.id}`}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize border transition-colors ${
              m.id === selected?.id
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'
            }`}
          >
            {m.name}
          </Link>
        ))}
      </div>

      {!selected || !first ? (
        <Card className="p-8 text-center text-gray-500">No loans found.</Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <h2 className="text-xl font-black capitalize text-gray-900">{selected.name}</h2>
              <span className="text-xs text-gray-400">as of {fmtDate(new Date())}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="Original loan" value={formatMoney(first.principal)} sub={fmtDate(first.startDate)} />
              <Stat label="Months charged" value={`${monthsCharged}`} sub={`${formatMoney((base * first.interestRate) / 100)}/month (${first.interestRate}% of ${formatMoney(base)})`} />
              <Stat label="Interest added" value={formatMoney(totalInterest)} />
              <Stat label="Payable now" value={formatMoney(payableNow)} sub={`as of ${fmtDate(now)}`} />
            </div>
          </Card>

          {/* Step-by-step */}
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3">Month</th>
                    <th className="text-right px-4 py-3">Balance</th>
                    <th className="text-right px-4 py-3">Interest</th>
                    <th className="text-right px-4 py-3">Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 tabular-nums">
                  {rows.map(({ loan, interest, fullInterest, payable, isFirst, days, daysInMonth }) => (
                    <tr key={loan.id} className={loan.status === 'ACTIVE' ? 'bg-indigo-50/60' : ''}>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{fmtMonth(loan.dueDate)}</span>
                        <div className="text-[11px] text-gray-400">
                          {isFirst ? `Loan from ${fmtDate(loan.startDate)}` : 'Unpaid balance carried over'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{formatMoney(loan.principal)}</td>
                      <td className="px-4 py-3 text-right text-amber-700">
                        {fullInterest > 0 ? `+${formatMoney(interest)}` : <span className="text-gray-400">—</span>}
                        <div className="text-[11px] text-gray-400">
                          {fullInterest > 0
                            ? `${loan.interestRate}% of ${formatMoney(base)}${days < daysInMonth ? ` × ${days}/${daysInMonth} days` : ''}`
                            : 'No interest (first month)'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold">{formatMoney(payable)}</span>
                        <div className="text-[11px] text-gray-400">
                          {days < daysInMonth ? `as of ${fmtDate(now)} · current` : `by ${fmtDate(loan.dueDate)} · unpaid`}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {payments.length > 0 && (
            <Card className="p-5 space-y-2">
              <h3 className="text-sm font-bold uppercase text-gray-700">Payments recorded</h3>
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between text-sm tabular-nums">
                  <span>{fmtDate(p.date)}</span>
                  <span className="text-green-700">−{formatMoney(p.amount)}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Current payable */}
          {active && activeRow && (
            <Card className="p-5 bg-indigo-50 border-indigo-100 space-y-2 tabular-nums">
              <h3 className="text-sm font-bold uppercase text-indigo-700">Payable as of {fmtDate(now)}</h3>
              <Line label="Balance carried over" value={formatMoney(active.principal)} />
              <Line
                label={`Interest so far (${active.interestRate}% of ${formatMoney(base)} × ${activeRow.days}/${activeRow.daysInMonth} days)`}
                value={`+${formatMoney(activeRow.interest)}`}
              />
              {active.amountPaid > 0 && <Line label="Already paid" value={`−${formatMoney(active.amountPaid)}`} />}
              <div className="border-t border-indigo-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-indigo-900">Total payable today</span>
                <span className="text-2xl font-black text-indigo-700">{formatMoney(payableNow)}</span>
              </div>
              {isPartial && (
                <p className="text-[11px] text-indigo-400">
                  Interest grows daily until the deadline on {fmtDate(active.dueDate)}, reaching the full{' '}
                  {active.interestRate}% ({formatMoney(payableOnDue)}). If still unpaid after the deadline, that amount
                  carries over to next month.
                </p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="font-black text-gray-900 tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-indigo-900/70">{label}</span>
      <span className="font-semibold text-indigo-900">{value}</span>
    </div>
  );
}
