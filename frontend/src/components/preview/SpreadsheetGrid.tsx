import React, { useState, useEffect } from 'react';
import { SheetPreviewData, GridCell } from '../../types';
import { Edit3, Check, RotateCcw, Save, Sparkles, Search } from 'lucide-react';

interface SpreadsheetGridProps {
  data: SheetPreviewData | null;
  sheetNames: string[];
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
  onSaveEdits?: (updates: { coordinate: string; value: string }[]) => Promise<void>;
  isSavingEdits?: boolean;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  data,
  sheetNames,
  activeSheet,
  onSelectSheet,
  onSaveEdits,
  isSavingEdits = false
}) => {
  const [editedCells, setEditedCells] = useState<Record<string, string>>({});
  const [activeCellCoord, setActiveCellCoord] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Reset edited cells when data changes
  useEffect(() => {
    setEditedCells({});
    setActiveCellCoord(null);
  }, [data?.sheet_name, data?.total_rows]);

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        No spreadsheet data to display.
      </div>
    );
  }

  const colCount = data.total_cols || (data.rows[0]?.length || 0);
  const colLetters = Array.from({ length: colCount }, (_, i) => String.fromCharCode(65 + i));

  const handleCellChange = (coord: string, val: string) => {
    setEditedCells((prev) => ({
      ...prev,
      [coord]: val
    }));
  };

  const pendingCount = Object.keys(editedCells).length;

  const handleApplyChanges = async () => {
    if (!onSaveEdits || pendingCount === 0) return;
    const updates = Object.entries(editedCells).map(([coordinate, value]) => ({
      coordinate,
      value
    }));
    await onSaveEdits(updates);
    setEditedCells({});
    setActiveCellCoord(null);
  };

  const handleResetEdits = () => {
    setEditedCells({});
    setActiveCellCoord(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Top Action & Mode Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Sheets Tab Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <span className="font-semibold text-slate-500 mr-1 uppercase text-[10px]">Sheet:</span>
          {sheetNames.map((s) => (
            <button
              key={s}
              onClick={() => onSelectSheet(s)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                activeSheet === s
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Edit & Search Tools */}
        <div className="flex items-center space-x-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find text / numbers..."
              className="pl-7 pr-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 w-36 focus:w-44 transition-all focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded text-xs font-semibold transition-all ${
              isEditMode
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Editing Enabled' : 'Click to Edit Cells'}</span>
          </button>

          {/* Pending Changes Save Button */}
          {pendingCount > 0 && (
            <div className="flex items-center space-x-1 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={isSavingEdits}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingEdits ? 'Applying...' : `Apply ${pendingCount} Changes`}</span>
              </button>
              <button
                type="button"
                onClick={handleResetEdits}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                title="Discard pending cell edits"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-auto flex-1 max-h-[520px] relative">
        <table className="excel-grid min-w-full text-slate-800">
          <thead className="sticky top-0 bg-slate-100 z-10 shadow-xs">
            <tr>
              <th className="w-10 bg-slate-200 text-slate-500 text-center text-[10px] font-bold border-r border-b border-slate-300">
                #
              </th>
              {colLetters.map((letter) => (
                <th
                  key={letter}
                  className="bg-slate-100 text-slate-600 text-center font-semibold text-[11px] border-r border-b border-slate-300 px-3 py-1.5"
                  style={{ width: data.col_widths?.[letter] ? `${data.col_widths[letter] * 8}px` : 'auto' }}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((rowCells, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <tr key={rowNum} className="hover:bg-blue-50/20 transition-colors">
                  <td className="bg-slate-100 text-slate-500 text-center text-[10px] font-medium border-r border-b border-slate-300 select-none">
                    {rowNum}
                  </td>
                  {rowCells.map((cell) => {
                    const coord = cell.coordinate;
                    const isEdited = coord in editedCells;
                    const displayVal = isEdited ? editedCells[coord] : cell.value;
                    const isEditing = isEditMode || activeCellCoord === coord;
                    const matchesSearch = searchQuery.trim() !== '' && displayVal.toLowerCase().includes(searchQuery.toLowerCase());

                    return (
                      <td
                        key={coord}
                        onClick={() => setActiveCellCoord(coord)}
                        className={`p-0 border-r border-b border-slate-200 relative ${
                          isEdited ? 'bg-amber-50 ring-1 ring-amber-400' : matchesSearch ? 'bg-yellow-100 font-bold' : ''
                        }`}
                        style={{
                          backgroundColor: isEdited ? '#FEF3C7' : matchesSearch ? '#FEF08A' : cell.fill || 'transparent',
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={displayVal}
                            onChange={(e) => handleCellChange(coord, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyChanges();
                              }
                            }}
                            className="w-full h-full px-2 py-1 text-[11px] bg-transparent border-0 focus:ring-2 focus:ring-blue-600 focus:outline-none font-inherit text-inherit"
                            style={{
                              color: cell.color || undefined,
                              fontWeight: cell.bold ? 'bold' : 'normal',
                              textAlign: (cell.alignH as any) || 'left'
                            }}
                          />
                        ) : (
                          <div
                            className={`px-2 py-1 truncate cursor-pointer text-[11px] ${
                              cell.alignH === 'center' ? 'text-center' : cell.alignH === 'right' ? 'text-right' : 'text-left'
                            } ${cell.bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}
                            style={{
                              color: cell.color || undefined
                            }}
                            title={`Click to edit ${coord}: ${displayVal}`}
                          >
                            {displayVal}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Hint */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Click any cell to edit invoice numbers, client names, line items, or prices directly.</span>
        </span>
        <span className="font-semibold text-slate-700">
          {pendingCount > 0 ? `${pendingCount} unsaved cell edit(s)` : `${data.total_rows} rows × ${data.total_cols} cols`}
        </span>
      </div>
    </div>
  );
};
