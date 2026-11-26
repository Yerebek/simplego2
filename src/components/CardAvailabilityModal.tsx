import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import {
  AvailabilityStatus,
  CardCharmDesign,
  RestockAlert,
} from '../data/simplygoData';
import { ResilientImage } from './ResilientImage';

export function getAvailabilityCounts(design: CardCharmDesign) {
  const totalCount = design.channels.length;
  const inStockCount = design.channels.filter(
    (c) => c.status === 'in-stock'
  ).length;
  const lowStockCount = design.channels.filter(
    (c) => c.status === 'low-stock'
  ).length;
  const outOfStockCount = design.channels.filter(
    (c) => c.status === 'out-of-stock'
  ).length;
  const availableCount = inStockCount + lowStockCount;
  return {
    totalCount,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    availableCount,
  };
}

export function AvailabilityStatusIndicator({
  status,
  label,
  compact = false,
}: {
  status: AvailabilityStatus;
  label: string;
  compact?: boolean;
}) {
  if (status === 'in-stock') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold text-emerald-700 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="tabular-nums">{label}</span>
      </span>
    );
  }

  if (status === 'low-stock') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold text-amber-700 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="tabular-nums">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-rose-700 ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </span>
  );
}

interface CardAvailabilityModalProps {
  design: CardCharmDesign;
  lastRefreshedAt: string | null;
  isRefreshing: boolean;
  onRefreshStock: () => void;
  restockAlerts: RestockAlert[];
  onToggleRestockAlert: (
    designId: string,
    channel: string,
    email: string
  ) => void;
  onClose: () => void;
  onViewCategory?: () => void;
  viewCategoryLabel?: string;
}

export function CardAvailabilityModal({
  design,
  lastRefreshedAt,
  isRefreshing,
  onRefreshStock,
  restockAlerts,
  onToggleRestockAlert,
  onClose,
  onViewCategory,
  viewCategoryLabel = 'View Full Category',
}: CardAvailabilityModalProps) {
  const [alertEmail, setAlertEmail] = useState('commuter@example.com');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const counts = getAvailabilityCounts(design);
  const designAlerts = restockAlerts.filter((a) => a.designId === design.id);

  const handleToggleChannelAlert = (channelName: string) => {
    const alreadyActive = designAlerts.some((a) => a.channel === channelName);
    const trimmedEmail = alertEmail.trim() || 'commuter@example.com';
    onToggleRestockAlert(design.id, channelName, trimmedEmail);

    if (alreadyActive) {
      setStatusFeedback(`Restock alert removed for ${channelName}.`);
    } else {
      setStatusFeedback(
        `Restock alert active for ${channelName} (${trimmedEmail}).`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a27]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`${design.name} Availability & Details`}
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#3f84c5]">
              {design.badge}
            </p>
            <h3 className="text-xl font-bold text-[#142333] mt-0.5">
              {design.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Close card availability preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media + Core Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          <div className="sm:col-span-5 bg-[#ebf2f9]/65 rounded-xl p-4 flex items-center justify-center">
            {design.videoUrl ? (
              <video
                src={design.videoUrl}
                poster={design.image}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="max-h-48 rounded-lg w-auto object-contain"
              />
            ) : (
              <ResilientImage
                src={design.image}
                alt={design.name}
                fallbackLabel={design.name}
                className="max-h-44 w-auto object-contain"
              />
            )}
          </div>

          <div className="sm:col-span-7 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              {design.description}
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">
                  Price / Pass Rate
                </span>
                <span className="text-[#316aa1] font-bold tabular-nums">
                  {design.priceOrFee}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">
                  Overall Stock
                </span>
                <AvailabilityStatusIndicator
                  status={design.availabilityStatus}
                  label={design.availabilityLabel}
                  compact
                />
              </div>
              {design.restockEstimate && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">
                    Restock Schedule
                  </span>
                  <span className="text-slate-700 font-semibold tabular-nums">
                    {design.restockEstimate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Availability Status Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-[#142333]">
                Live Channel & Outlet Availability
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
                <span>
                  {counts.availableCount} of {counts.totalCount} channels
                  available
                </span>
                {counts.outOfStockCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-700 font-medium">
                      {counts.outOfStockCount} restocking
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {lastRefreshedAt
                    ? `Checked at ${lastRefreshedAt}`
                    : design.lastUpdated}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefreshStock}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#ebf2f9] border border-slate-300 hover:border-[#316aa1] text-[#316aa1] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{isRefreshing ? 'Checking Outlets...' : 'Refresh Stock'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">{design.availabilityDetail}</p>
        </div>

        {/* Per-Channel Breakdown List */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-[#142333]">
              Where to Buy & Real-Time Stock Status
            </h4>
            {(counts.lowStockCount > 0 || counts.outOfStockCount > 0) && (
              <div className="flex items-center gap-2 text-xs">
                <label
                  htmlFor="restock-alert-email"
                  className="text-slate-500 shrink-0"
                >
                  Alert email:
                </label>
                <input
                  id="restock-alert-email"
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs text-[#142333] w-44 focus:outline-none focus:border-[#316aa1]"
                />
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {design.channels.map((ch) => {
              const hasAlert = designAlerts.some(
                (a) => a.channel === ch.channel
              );
              const needsAlertOption =
                ch.status === 'out-of-stock' || ch.status === 'low-stock';

              return (
                <div
                  key={ch.channel}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#142333]">
                        {ch.channel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {ch.channelType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {ch.fulfillmentNote}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <AvailabilityStatusIndicator
                      status={ch.status}
                      label={ch.stockNote}
                      compact
                    />

                    {needsAlertOption && (
                      <button
                        type="button"
                        onClick={() => handleToggleChannelAlert(ch.channel)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          hasAlert
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-white border-slate-300 text-[#316aa1] hover:border-[#316aa1] hover:bg-[#ebf2f9]/50'
                        }`}
                      >
                        {hasAlert ? (
                          <>
                            <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Alert Active</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Notify Me</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {statusFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{statusFeedback}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-500 tabular-nums">
            {designAlerts.length > 0
              ? `${designAlerts.length} restock ${
                  designAlerts.length === 1 ? 'alert' : 'alerts'
                } active for this item`
              : 'Stock levels reflect latest counter & online sync'}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            {onViewCategory && (
              <button
                type="button"
                onClick={onViewCategory}
                className="px-4 py-2 bg-[#316aa1] hover:bg-[#255582] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {viewCategoryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
