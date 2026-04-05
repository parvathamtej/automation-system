import React, { useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

export const DataTable = ({ data, columns }) => {
  const [sorting, setSorting] = React.useState([]);
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef(null);
  const { rows } = table.getRowModel();

  // Virtualizer for rendering thousands of rows efficiently
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // CELL_HEIGHT logic
    overscan: 10,
  });

  return (
    <div style={{
      border: '1px solid var(--color-ui-border)',
      borderRadius: 'var(--border-radius-l)',
      background: 'var(--color-ui-bg-panel)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-elevation-sm)',
    }}>
      <div 
        ref={tableContainerRef} 
        style={{ 
          maxHeight: '600px', 
          overflow: 'auto', 
          position: 'relative',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-family-data)' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-ui-bg-base)', boxShadow: '0 1px 0 var(--color-ui-border)' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ 
                    padding: 'var(--spacing-s) var(--spacing-m)', 
                    fontWeight: 600, 
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-s)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--color-ui-border)'
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ 
            display: 'block', // Required for Virtualizer internal div height setting hack if using actual table tags
            position: 'relative',
            height: `${rowVirtualizer.getTotalSize()}px`
          }}>
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <tr 
                  key={row.id} 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'flex',
                    borderBottom: '1px solid var(--color-ui-border)',
                    background: 'var(--color-ui-bg-panel)'
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ 
                      flex: cell.column.getSize(),
                      padding: 'var(--spacing-s) var(--spacing-m)', 
                      fontSize: 'var(--font-size-s)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
