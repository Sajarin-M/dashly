import { createAvatarComponent, createTableComponent } from '@dashly/core/src';

const Avatar = createAvatarComponent({
  getImageUrl: (name: string) => name,
});

const { Table } = createTableComponent({
  getImageUrl: () => '',
  AvatarComponent: Avatar,
  renderImageOnScroll: () => true,
  atBottomThreshold: 300,
  increaseViewportBy: 100,
  overscan: 5,
});

const generateUser = (count: number) => ({
  id: count,
  name: `User ${count}`,
  rollNo: count,
  about: `Hi am customer ${count}`,
});

const users = Array(100)
  .fill(0)
  .map((_, i) => generateUser(i + 1));

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        flexDirection: 'column',
      }}
    >
      <Table
        data={users}
        avatar={{ name: (u) => u.name }}
        gridColumns='20% 12rem 1fr'
        onRowClick={(row) => console.log('row click', row)}
        columns={[
          { name: 'Name', path: 'name' },
          { name: 'Roll No', path: 'rollNo' },
          { name: 'About', path: 'about' },
        ]}
        menu={{
          onEdit: (row) => console.log('edit', row),
          onDelete: (row) => console.log('delete', row),
        }}
      />
    </div>
  );
}
