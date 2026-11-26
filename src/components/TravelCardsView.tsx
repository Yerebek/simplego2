import { useState } from 'react';
import {
  Check,
  ArrowRight,
  Calculator,
  RefreshCw,
  Clock,
  Bell,
  BellRing,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  AVAILABILITY_OUTLET_OPTIONS,
  CARD_CHARM_DESIGNS,
  CARD_PRODUCTS,
  CardCharmDesign,
  RestockAlert,
  ScreenId,
} from '../data/simplygoData';
import { ResilientImage } from './ResilientImage';
import {
  AvailabilityStatusIndicator,
  CardAvailabilityModal,
} from './CardAvailabilityModal';
import { BreadcrumbBar } from './CommandPalette';

type CardTabId = 'ezlink' | 'charms' | 'concession' | 'motoring';

interface TravelCardsViewProps {
  initialTab: CardTabId;
  onNavigate: (screen: ScreenId) => void;
  lastRefreshedAt: string | null;
  isRefreshingStock: boolean;
  onRefreshStock: () => void;
  restockAlerts: RestockAlert[];
  onToggleRestockAlert: (
    designId: string,
    channel: string,
    email: string
  ) => void;
  pinnedIds: string[];
  onTogglePin: (shortcutId: string) => void;
}

const TABS: {
  id: CardTabId;
  label: string;
  image: string;
  summary: string;
}[] = [
  {
    id: 'ezlink',
    label: 'EZ-Link & Bank Cards',
    image: 'https://simplygo.com.sg/media/rekjpvnv/ez-link-blue-card.png',
    summary:
      'Everyday stored-value cards and contactless bank cards for all commuters. Available off-the-shelf with no eligibility checks.',
  },
  {
    id: 'charms',
    label: 'EZ-Link Charms',
    image: 'https://simplygo.com.sg/media/hy0flez5/new-launches.jpg',
    summary:
      'Wearable tap-and-go accessories and limited-edition collectibles. Sold without stored value; top up before riding.',
  },
  {
    id: 'concession',
    label: 'Concession Cards',
    image:
      'https://simplygo.com.sg/media/x33lrgvq/concession-monthly_travel_cards.png',
    summary:
      'Personalised subsidised transit cards and Monthly Travel Passes for eligible Students, Seniors, Children, PWD, and Adults.',
  },
  {
    id: 'motoring',
    label: 'EZ-Link Motoring & EV',
    image: 'https://simplygo.com.sg/media/dg3phwal/ez-link-motoring.png',
    summary:
      'Post-paid cardless billing for ERP gantries, HDB/URA carparks, and public EV charging sessions.',
  },
];

export function TravelCardsView({
  initialTab,
  onNavigate,
  lastRefreshedAt,
  isRefreshingStock,
  onRefreshStock,
  restockAlerts,
  onToggleRestockAlert,
  pinnedIds,
  onTogglePin,
}: TravelCardsViewProps) {
  const [activeTab, setActiveTab] = useState<CardTabId>(initialTab);
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(12);
  const [avgFare, setAvgFare] = useState<number>(1.85);
  const [selectedOutlet, setSelectedOutlet] = useState<string>(
    'All Outlets & Channels'
  );
  const [stockFilter, setStockFilter] = useState<
    'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  >('all');
  const [selectedDesign, setSelectedDesign] =
    useState<CardCharmDesign | null>(null);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);

  const toggleProductDetails = (productId: string) => {
    setExpandedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const monthlyPayAsYouGo = tripsPerWeek * 4.33 * avgFare;
  const adultPassCost = 128;
  const monthlySavings = monthlyPayAsYouGo - adultPassCost;

  const filteredProducts = CARD_PRODUCTS.filter((p) => p.category === activeTab);
  const categoryDesigns = CARD_CHARM_DESIGNS.filter((d) =>
    activeTab === 'ezlink'
      ? d.category === 'ezlink'
      : activeTab === 'charms'
      ? d.category === 'charm'
      : activeTab === 'concession'
      ? d.category === 'concession'
      : false
  );

  const findMatchedChannel = (design: CardCharmDesign) => {
    if (selectedOutlet === 'All Outlets & Channels') return null;
    const key = selectedOutlet.toLowerCase();
    return (
      design.channels.find(
        (ch) =>
          ch.channel.toLowerCase().includes(key) ||
          key.includes(ch.channel.toLowerCase()) ||
          (key.includes('ticket office') &&
            ch.channel.toLowerCase().includes('all counters')) ||
          (key.includes('service centre') &&
            ch.channel.toLowerCase().includes('centres'))
      ) ?? null
    );
  };

  const filteredDesigns = categoryDesigns.filter((design) => {
    const matchedCh = findMatchedChannel(design);
    if (selectedOutlet !== 'All Outlets & Channels' && !matchedCh) {
      return false;
    }

    const effectiveStatus = matchedCh
      ? matchedCh.status
      : design.availabilityStatus;

    if (stockFilter === 'all') return true;
    if (stockFilter === 'out-of-stock') {
      return (
        effectiveStatus === 'out-of-stock' ||
        design.channels.some((ch) => ch.status === 'out-of-stock')
      );
    }
    return effectiveStatus === stockFilter;
  });

  const activeTabInfo = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const pinId =
    activeTab === 'charms'
      ? 'nav-charms'
      : activeTab === 'concession'
      ? 'nav-concession-cards'
      : activeTab === 'motoring'
      ? 'nav-motoring-cards'
      : 'nav-cards';

  return (
    <section className="py-10 lg:py-14 bg-white min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <BreadcrumbBar
          currentLabel={`Cards & Charms · ${activeTabInfo.label}`}
          onGoHome={() => onNavigate('home')}
          shortcutLabel={activeTabInfo.label}
          isPinned={pinnedIds.includes(pinId)}
          onTogglePin={() => onTogglePin(pinId)}
        />
        {/* Intro + 4 Clear Category Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#ebf2f9] rounded-2xl p-6 sm:p-10">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-sm font-semibold text-[#3f84c5]">
              Clear Transit & Motoring Guide
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#142333]">
              {activeTabInfo.label}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              {activeTabInfo.summary}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#316aa1] text-white'
                        : 'bg-white text-slate-700 hover:text-[#316aa1] border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <ResilientImage
              src={activeTabInfo.image}
              alt={activeTabInfo.label}
              className="max-h-44 w-auto object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Visual Designs + Live Availability for Selected Category */}
        {categoryDesigns.length > 0 && (
          <div className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#142333]">
                  {activeTab === 'ezlink'
                    ? 'EZ-Link & SimplyGo EZ-Link Card Designs'
                    : activeTab === 'charms'
                    ? 'Latest Wearable EZ-Link Charms'
                    : 'Official Concession Card Designs'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {activeTab === 'charms'
                    ? 'Collectible wearables sold empty (top up at Ticket Offices, Self-Help Machines, or via SimplyGo App).'
                    : activeTab === 'concession'
                    ? 'Requires Singpass MyInfo / eligibility verification for subsidised concession fares.'
                    : 'Standard stored-value cards available to everyone without application.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onRefreshStock}
                disabled={isRefreshingStock}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#ebf2f9] border border-slate-300 hover:border-[#316aa1] text-[#316aa1] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isRefreshingStock ? 'animate-spin' : ''
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {isRefreshingStock
                    ? 'Checking Live Stock...'
                    : 'Refresh Live Stock'}
                </span>
              </button>
            </div>

            {/* Outlet & Availability Filter Strip */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#142333]">
                  <Store className="w-4 h-4 text-[#316aa1]" aria-hidden="true" />
                  <label htmlFor="outlet-availability-select">
                    Check Outlet / Channel:
                  </label>
                </div>
                <select
                  id="outlet-availability-select"
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-[#142333] focus:outline-none focus:border-[#316aa1] cursor-pointer"
                >
                  {AVAILABILITY_OUTLET_OPTIONS.map((outlet) => (
                    <option key={outlet} value={outlet}>
                      {outlet}
                    </option>
                  ))}
                </select>
                <span
                  aria-live="polite"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums"
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {isRefreshingStock
                    ? 'Syncing outlet inventory...'
                    : lastRefreshedAt
                    ? `Verified at ${lastRefreshedAt}`
                    : 'Live outlet sync active'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl self-start lg:self-auto">
                {[
                  { id: 'all', label: 'All Statuses' },
                  { id: 'in-stock', label: 'In Stock' },
                  { id: 'low-stock', label: 'Low Stock' },
                  { id: 'out-of-stock', label: 'Restocking Outlets' },
                ].map((opt) => {
                  const active = stockFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setStockFilter(
                          opt.id as
                            | 'all'
                            | 'in-stock'
                            | 'low-stock'
                            | 'out-of-stock'
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#316aa1] text-white'
                          : 'text-slate-600 hover:text-[#142333]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredDesigns.length === 0 ? (
              <div className="border border-slate-200 rounded-2xl p-8 text-center bg-slate-50 space-y-3">
                <p className="text-sm font-semibold text-[#142333]">
                  No {activeTabInfo.label.toLowerCase()} matched "{selectedOutlet}" with the selected availability filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOutlet('All Outlets & Channels');
                    setStockFilter('all');
                  }}
                  className="px-4 py-2 bg-[#316aa1] hover:bg-[#255582] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Reset Outlet & Stock Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDesigns.map((design) => {
                  const matchedChannel = findMatchedChannel(design);
                  const alternativeChannel = design.channels.find(
                    (c) => c.status === 'in-stock'
                  );
                  const designAlerts = restockAlerts.filter(
                    (a) => a.designId === design.id
                  );
                  const matchedAlertActive = matchedChannel
                    ? designAlerts.some(
                        (a) => a.channel === matchedChannel.channel
                      )
                    : false;

                  return (
                    <div
                      key={design.id}
                      className="border border-slate-200 rounded-2xl p-5 bg-white flex flex-col justify-between hover:border-[#316aa1]/50 transition-colors"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedDesign(design)}
                          className="w-full h-44 rounded-xl bg-[#ebf2f9]/55 flex items-center justify-center p-3 mb-4 overflow-hidden cursor-pointer"
                          aria-label={`View details and outlet stock for ${design.name}`}
                        >
                          {design.videoUrl ? (
                            <video
                              src={design.videoUrl}
                              poster={design.image}
                              controls
                              muted
                              loop
                              playsInline
                              className="max-h-40 rounded-lg w-auto object-contain"
                            />
                          ) : (
                            <ResilientImage
                              src={design.image}
                              alt={design.name}
                              fallbackLabel={design.name}
                              className="max-h-36 w-auto object-contain"
                            />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDesign(design)}
                          className="text-left cursor-pointer group"
                        >
                          <h3 className="text-lg font-bold text-[#142333] group-hover:text-[#316aa1] transition-colors">
                            {design.name}
                          </h3>
                        </button>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3 text-xs">
                        {/* Key Availability Status */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <AvailabilityStatusIndicator
                              status={
                                matchedChannel
                                  ? matchedChannel.status
                                  : design.availabilityStatus
                              }
                              label={
                                matchedChannel
                                  ? `${matchedChannel.channel}: ${matchedChannel.stockNote}`
                                  : design.availabilityLabel
                              }
                              compact
                            />
                            {designAlerts.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                                <BellRing
                                  className="w-3 h-3"
                                  aria-hidden="true"
                                />
                                <span>{designAlerts.length} alert</span>
                              </span>
                            )}
                          </div>

                          {matchedChannel && (
                            <p className="text-slate-500 leading-relaxed">
                              {matchedChannel.status === 'out-of-stock' &&
                              alternativeChannel
                                ? `${matchedChannel.fulfillmentNote} · Available now at ${alternativeChannel.channel}.`
                                : matchedChannel.fulfillmentNote}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="font-bold text-[#316aa1] tabular-nums">
                            {design.priceOrFee}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            {matchedChannel &&
                              (matchedChannel.status === 'out-of-stock' ||
                                matchedChannel.status === 'low-stock') && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onToggleRestockAlert(
                                      design.id,
                                      matchedChannel.channel,
                                      'commuter@example.com'
                                    )
                                  }
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                    matchedAlertActive
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                      : 'bg-white border-slate-300 text-[#316aa1] hover:border-[#316aa1]'
                                  }`}
                                >
                                  {matchedAlertActive ? (
                                    <BellRing
                                      className="w-3 h-3"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Bell
                                      className="w-3 h-3"
                                      aria-hidden="true"
                                    />
                                  )}
                                  <span>
                                    {matchedAlertActive
                                      ? 'Alert On'
                                      : 'Notify'}
                                  </span>
                                </button>
                              )}

                            <button
                              type="button"
                              onClick={() => setSelectedDesign(design)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ebf2f9] hover:bg-[#dce8f5] text-[#316aa1] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                              <span>Details & Stock</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Product Details (Key Info Upfront, Click to Expand Benefits) */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const isExpanded = expandedProductIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between bg-white"
                >
                  <div>
                    <p className="text-xs font-medium text-[#3f84c5]">
                      {product.eligibility}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#142333] mt-1">
                      {product.name}
                    </h2>

                    <button
                      type="button"
                      onClick={() => toggleProductDetails(product.id)}
                      aria-expanded={isExpanded}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#316aa1] hover:text-[#255582] cursor-pointer"
                    >
                      <span>
                        {isExpanded
                          ? 'Hide details & benefits'
                          : 'View details & key benefits'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {product.tagline}
                        </p>
                        <ul className="space-y-2">
                          {product.keyBenefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-start gap-2.5 text-sm text-slate-700"
                            >
                              <Check className="w-4 h-4 text-[#316aa1] shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500 block">
                        {product.monthlyPassPrice ? 'Monthly Pass' : 'Typical Fare'}
                      </span>
                      <span className="text-sm font-bold text-[#316aa1] tabular-nums">
                        {product.monthlyPassPrice || product.fareExample}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('services')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ebf2f9] hover:bg-[#dce8f5] text-[#316aa1] text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Check Fares</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Adult Monthly Travel Pass Break-Even Estimator */}
        {activeTab === 'concession' && (
          <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2 text-[#316aa1] font-semibold text-sm">
                  <Calculator className="w-4 h-4" />
                  <span>Monthly Travel Pass Break-Even Estimator</span>
                </div>
                <h2 className="text-2xl font-bold text-[#142333]">
                  Should you buy the $128.00 Adult Monthly Travel Card?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-[#142333] mb-2">
                      <span>Trips per Week</span>
                      <span className="tabular-nums text-[#316aa1]">
                        {tripsPerWeek} trips
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={28}
                      step={1}
                      value={tripsPerWeek}
                      onChange={(e) => setTripsPerWeek(Number(e.target.value))}
                      className="w-full accent-[#316aa1] cursor-pointer"
                      aria-label="Trips per week"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold text-[#142333] mb-2">
                      <span>Average Fare per Trip</span>
                      <span className="tabular-nums text-[#316aa1]">
                        ${avgFare.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1.19}
                      max={2.38}
                      step={0.05}
                      value={avgFare}
                      onChange={(e) => setAvgFare(Number(e.target.value))}
                      className="w-full accent-[#316aa1] cursor-pointer"
                      aria-label="Average fare per trip"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Estimated Pay-As-You-Go</span>
                  <span className="font-bold text-[#142333] tabular-nums">
                    ${monthlyPayAsYouGo.toFixed(2)} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Adult Monthly Travel Card</span>
                  <span className="font-bold text-[#142333] tabular-nums">
                    $128.00 / mo
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#142333]">
                    Recommendation
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      monthlySavings > 0 ? 'text-emerald-700' : 'text-[#316aa1]'
                    }`}
                  >
                    {monthlySavings > 0
                      ? `Monthly Pass saves $${monthlySavings.toFixed(2)}/mo`
                      : `Pay-As-You-Go saves $${Math.abs(monthlySavings).toFixed(2)}/mo`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Card & Charm Availability Modal */}
        {selectedDesign && (
          <CardAvailabilityModal
            design={selectedDesign}
            lastRefreshedAt={lastRefreshedAt}
            isRefreshing={isRefreshingStock}
            onRefreshStock={onRefreshStock}
            restockAlerts={restockAlerts}
            onToggleRestockAlert={onToggleRestockAlert}
            onClose={() => setSelectedDesign(null)}
            onViewCategory={() => {
              setSelectedDesign(null);
              onNavigate('locations');
            }}
            viewCategoryLabel="Find MRT Locations"
          />
        )}
      </div>
    </section>
  );
}
