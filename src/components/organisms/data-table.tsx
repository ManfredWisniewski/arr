import React from 'react'

import { cx } from '@/lib/cx'

export type DataTableColumn = {
  key: string
  label: string
}

// Data table — columns + rows render semantic table markup
// (.data-table contract classes). Cells accept React nodes.
export const DataTable = ({
  className,
  columns,
  rows,
}: {
  className?: string
  columns: DataTableColumn[]
  rows: Array<Record<string, React.ReactNode>>
}) => (
  <div className={cx('data-table-wrap', className)}>
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} scope="col">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
