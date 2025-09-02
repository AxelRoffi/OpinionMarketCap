'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Opinion, TableSort, SortDirection, SortField } from '@/lib/types';
import { formatUSDC, formatPercentage, truncateAddress, getCategoryColor, cn } from '@/lib/utils';
import BuyAnswerModal from './BuyAnswerModal';

interface TradingTableProps {
  opinions: Opinion[];
  loading?: boolean;
  onRefresh?: () => void;
}

const TradingTable = ({ opinions, loading = false, onRefresh }: TradingTableProps) => {
  const [sort, setSort] = useState<TableSort>({ field: 'totalVolume', direction: 'desc' });
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);

  const sortedOpinions = useMemo(() => {
    if (!opinions.length) return [];

    return [...opinions].sort((a, b) => {
      const { field, direction } = sort;
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle bigint values
      if (typeof aValue === 'bigint') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // Handle string comparisons
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [opinions, sort]);

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!opinions.length) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opinions Yet</h3>
        <p className="text-gray-600 mb-4">Be the first to create an opinion on the market!</p>
        <button 
          className="btn-primary"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="question"
                  label="Question"
                  sort={sort}
                  onSort={handleSort}
                  getSortIcon={getSortIcon}
                  className="min-w-[300px]"
                />
                <th className="table-header min-w-[200px]">Answer</th>
                <SortableHeader
                  field="nextPrice"
                  label="Next Price"
                  sort={sort}
                  onSort={handleSort}
                  getSortIcon={getSortIcon}
                  className="text-right"
                />
                <th className="table-header text-right">Change</th>
                <SortableHeader
                  field="totalVolume"
                  label="Volume"
                  sort={sort}
                  onSort={handleSort}
                  getSortIcon={getSortIcon}
                  className="text-right"
                />
                <th className="table-header">Owner</th>
                <th className="table-header">Category</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOpinions.map((opinion) => (
                <OpinionRow
                  key={opinion.id}
                  opinion={opinion}
                  onBuyAnswer={() => setSelectedOpinion(opinion)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOpinion && (
        <BuyAnswerModal
          opinion={selectedOpinion}
          onClose={() => setSelectedOpinion(null)}
          onSuccess={() => {
            setSelectedOpinion(null);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};

interface SortableHeaderProps {
  field: SortField;
  label: string;
  sort: TableSort;
  onSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => React.ReactNode;
  className?: string;
}

const SortableHeader = ({ field, label, sort, onSort, getSortIcon, className }: SortableHeaderProps) => (
  <th
    className={cn("table-header cursor-pointer hover:bg-gray-100 transition-colors", className)}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-2">
      {label}
      {getSortIcon(field)}
    </div>
  </th>
);

interface OpinionRowProps {
  opinion: Opinion;
  onBuyAnswer: () => void;
}

const OpinionRow = ({ opinion, onBuyAnswer }: OpinionRowProps) => {
  const priceChange = opinion.priceChange || 0;
  const { text: changeText, className: changeClass } = formatPercentage(priceChange);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Question */}
      <td className="table-cell">
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate" title={opinion.question}>
            {opinion.question}
          </p>
          <p className="text-sm text-gray-500 mt-1">#{opinion.id}</p>
        </div>
      </td>

      {/* Answer */}
      <td className="table-cell">
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate" title={opinion.currentAnswer}>
            {opinion.currentAnswer}
          </p>
          {opinion.currentAnswerDescription && (
            <p className="text-sm text-gray-500 truncate" title={opinion.currentAnswerDescription}>
              {opinion.currentAnswerDescription}
            </p>
          )}
        </div>
      </td>

      {/* Next Price */}
      <td className="table-cell text-right">
        <span className="font-semibold text-gray-900">
          {formatUSDC(opinion.nextPrice)}
        </span>
      </td>

      {/* Change */}
      <td className="table-cell text-right">
        <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", changeClass)}>
          {priceChange > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : priceChange < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : null}
          {changeText}
        </div>
      </td>

      {/* Volume */}
      <td className="table-cell text-right">
        <span className="font-semibold text-gray-900">
          {formatUSDC(opinion.totalVolume)}
        </span>
      </td>

      {/* Owner */}
      <td className="table-cell">
        <span className="text-sm font-mono text-gray-600">
          {truncateAddress(opinion.currentAnswerOwner)}
        </span>
      </td>

      {/* Category */}
      <td className="table-cell">
        <div className="flex flex-wrap gap-1">
          {opinion.categories.slice(0, 2).map((category) => (
            <span
              key={category}
              className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoryColor(category))}
            >
              {category}
            </span>
          ))}
          {opinion.categories.length > 2 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{opinion.categories.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="table-cell text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onBuyAnswer}
            className="btn-primary text-xs px-3 py-1"
            disabled={!opinion.isActive}
          >
            Buy Answer
          </button>
          {opinion.link && (
            <a
              href={opinion.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="External Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
};

const LoadingSkeleton = () => (
  <div className="card p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Question</th>
            <th className="table-header">Answer</th>
            <th className="table-header">Next Price</th>
            <th className="table-header">Change</th>
            <th className="table-header">Volume</th>
            <th className="table-header">Owner</th>
            <th className="table-header">Category</th>
            <th className="table-header">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              {[...Array(8)].map((_, j) => (
                <td key={j} className="table-cell">
                  <div className="loading-shimmer h-4 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TradingTable;