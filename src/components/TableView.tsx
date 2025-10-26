import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import type { FunctionComponent } from 'react';

import type { Theme } from '../theme/colors';
import { darkTheme, lightTheme } from '../theme/colors';

interface TableColumn {
  key: string;
  label: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  headerColor?: string;
  backgroundColor?: string;
}

interface TableRow {
  [key: string]: string | number | undefined;
  backgroundColor?: string;
  textColor?: string;
}

interface TableViewProps {
  columns: TableColumn[];
  data: TableRow[];
  showTotal?: boolean;
  totalRow?: TableRow;
  emptyMessage?: string;
  theme?: Theme;
}

export const TableView: FunctionComponent<TableViewProps> = ({
  columns,
  data,
  showTotal = false,
  totalRow,
  emptyMessage = 'No hay datos',
  theme: propTheme,
}) => {
  const colorScheme = useColorScheme();
  const theme = propTheme ?? (colorScheme === 'dark' ? darkTheme : lightTheme);

  const renderCell = (
    content: string | number | undefined,
    column: TableColumn,
    rowData?: TableRow,
    isHeader: boolean = false,
    isTotal: boolean = false,
  ) => {
    const value = content ?? '0';
    const textAlign = column.align ?? 'center';
    const backgroundColor = isHeader
      ? theme.tableHeader
      : isTotal
      ? theme.tableTotal
      : rowData?.backgroundColor ?? column.backgroundColor ?? theme.surface;

    const textColor = isHeader
      ? theme.tableHeaderText
      : isTotal
      ? theme.text
      : rowData?.textColor ?? theme.text;

    return (
      <View
        key={column.key}
        style={[
          styles.cell,
          {
            flex: column.width,
            backgroundColor,
            borderRightWidth: 1,
            borderRightColor: theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cellText,
            {
              textAlign,
              color: textColor,
              fontWeight: isHeader || isTotal ? '700' : '500',
              fontSize: isHeader ? 11 : isTotal ? 12 : 11,
            },
          ]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.row, { borderBottomColor: theme.border }]}>
        {columns.map((column) => renderCell(column.label, column, undefined, true))}
      </View>

      {data.length > 0 ? (
        data.map((row, index) => (
          <View key={index} style={[styles.row, { borderBottomColor: theme.border }]}>
            {columns.map((column) => renderCell(row[column.key], column, row))}
          </View>
        ))
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{emptyMessage}</Text>
        </View>
      )}

      {showTotal && totalRow ? (
        <View style={[styles.row, styles.totalRow, { borderTopColor: theme.primary, backgroundColor: theme.tableTotal }]}>
          {columns.map((column) => renderCell(totalRow[column.key], column, undefined, false, true))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  totalRow: {
    borderTopWidth: 2,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    minHeight: 40,
  },
  cellText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
