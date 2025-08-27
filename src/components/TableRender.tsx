import { Table } from 'antd';
import type { TableProps } from 'antd';
import React from 'react';

interface TableRenderProps {
  data: any[];
}

const TableRender = ({ data }: TableRenderProps) => {
  // 如果没有数据，不渲染任何东西
  if (!data || data.length === 0) {
    return <div style={{ padding: 24, textAlign: 'center' }}>暂无表格数据</div>;
  }

  // 动态生成表格的列配置
  // 我们从数据的第一行中获取所有的 key，并用它们来创建列
  const columns: TableProps['columns'] = Object.keys(data[0]).map(key => ({
    title: key.toUpperCase(), // 将 key 转换为大写作为列标题
    dataIndex: key,
    key: key,
  }));

  return (
    <div style={{ overflow: 'auto' }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record, index) => index?.toString() || ''} // 为每一行提供一个唯一的 key
        pagination={false} // 暂时禁用分页
        bordered // 显示边框
      />
    </div>
  );
};

export default TableRender;