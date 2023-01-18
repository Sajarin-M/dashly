import {
  CSSProperties,
  ComponentProps,
  ComponentType,
  ReactNode,
  forwardRef,
  useState,
} from 'react';
import { BiWifiOff } from 'react-icons/bi';
import { FaBookOpen } from 'react-icons/fa';
import { Components, Virtuoso, VirtuosoProps } from 'react-virtuoso';
import {
  Box,
  BoxProps,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  TypographyStylesProvider,
  createStyles,
  packSx,
} from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/utils';
import type { Object } from 'ts-toolbelt';
import type { AvatarProps } from '../avatar';
import { Menu, MenuButton, MenuItem, menuItems } from '../menu';
import './index.css';

const useOnlineStatus = () => true;

interface FCWithChildren {
  children?: ReactNode;
}

export type TableColumn<T> = Object.AtLeast<
  {
    key?: string;
    name?: string;
    style?: CSSProperties;
  },
  'name' | 'key'
> &
  (
    | { path: keyof T }
    | {
        cell: (row: T, index: number) => ReactNode;
      }
  );

type RowHandlerFn<T, R = void> = (row: T) => R;

export type TableContext = {
  height: number;
  loadMore?: LoadMoreProps;
};

export type LoadMoreProps = {
  isError: boolean;
  isLoading: boolean;
  load: VoidFunction;
  retry: VoidFunction;
};

export type TableMenu<T> =
  | {
      onEdit: RowHandlerFn<T>;
      onDelete: RowHandlerFn<T>;
    }
  | RowHandlerFn<T, MenuItem[]>;

export type TableProps<T> = Omit<
  VirtuosoProps<T, TableContext>,
  'className' | 'components' | 'itemContent' | 'isScrolling' | 'atBottomStateChange'
> & {
  data: readonly T[];
  reset?: VoidFunction;
  isError?: boolean;
  gridColumns: string;
  isLoading?: boolean;
  showHeader?: boolean;
  noDataMessage?: string;
  showSerialNo?: boolean;
  loadMore?: LoadMoreProps;
  columns: TableColumn<T>[];
  onRowClick?: RowHandlerFn<T>;
  components?: Omit<Components<unknown, TableContext>, 'Item'> & {
    StickyHeader?: ReactNode;
    StickyFooter?: ReactNode;
  };
  menu?: TableMenu<T>;
  avatar?: {
    name: RowHandlerFn<T, string>;
    image?: RowHandlerFn<T, string>;
  };
};

export enum ColumnSizes {
  Menu = '2rem',
  Serial = '2.6rem',
  Avatar = '3.8rem',
}

const useStyles = createStyles((theme) => {
  let commonBg = theme.black;
  let trackBg = theme.colors.gray[4];

  if (theme.colorScheme === 'dark') {
    commonBg = theme.white;
    trackBg = theme.colors.gray[7];
  }

  return {
    virtualBody: {
      overflowY: 'overlay !important' as any,

      '&::-webkit-scrollbar-track': {
        borderRadius: theme.radius.md,
        backgroundColor: theme.fn.rgba(trackBg, 0.8),
      },
      '&::-webkit-scrollbar': {
        width: 8,
        borderRadius: theme.radius.md,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.fn.rgba(commonBg, 0.3),
        borderRadius: theme.radius.md,
        '&:hover': {
          backgroundColor: theme.fn.rgba(commonBg, 0.4),
        },
      },
    },
  };
});

function renderCell<T>(rowData: T, column: TableColumn<T>, index: number) {
  if ('path' in column) {
    const value = rowData[column.path] as unknown as string;
    return (
      <div className='truncate' title={value}>
        {value}
      </div>
    );
  }
  return column.cell(rowData, index);
}

type BoxComponentProps = PolymorphicComponentProps<'div', BoxProps>;

type TableRowProps = BoxComponentProps & {
  highlightOnHover?: boolean;
  withBorder?: boolean;
  vAlign?: CSSProperties['alignItems'];
};

type TableMenuProps<T> = {
  row: T;
  menuFn: RowHandlerFn<T, MenuItem[]>;
};

type CreateTableComponentProps = {
  getImageUrl: (name: string) => string;
  renderImageOnScroll: (url: string) => boolean;
  AvatarComponent: (props: Pick<AvatarProps, 'text' | 'src'>) => JSX.Element;
};

const TableRow = forwardRef<HTMLDivElement, TableRowProps>(
  (
    { highlightOnHover = true, withBorder = false, vAlign = 'center', sx, onClick, ...rest },
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={[
          (theme) => ({
            display: 'grid',
            columnGap: '1rem',
            alignItems: vAlign,
            padding: '0.5rem 1rem',
            borderRadius: theme.radius.md,
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            '&:hover': highlightOnHover
              ? {
                  backgroundColor:
                    theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
                }
              : {},
            ...(withBorder && {
              border: theme.colorScheme === 'dark' ? '1px solid #373A40' : '1px solid #dee2e6',
            }),
            ...(onClick && {
              '&:active': theme.activeStyles,
            }),
          }),
          ...packSx(sx),
        ]}
        {...rest}
      />
    );
  },
);

function TableHeader({ style, ...rest }: BoxComponentProps) {
  return (
    <Box
      style={{
        ...style,
        display: 'grid',
        alignItems: 'center',
        columnGap: '1rem',
        padding: '0.5rem 1rem',
      }}
      {...rest}
    />
  );
}

function TableRowWrapper(props: ComponentProps<'div'>) {
  return <div {...props} className='virtual-row-wrapper' />;
}

function InfoWrapper({ children }: FCWithChildren) {
  return (
    <Center
      sx={(theme) => ({
        flexGrow: 1,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        ':last-child': {
          boxShadow: theme.shadows.sm,
        },
      })}
    >
      {children}
    </Center>
  );
}

function EmptyTableMenu() {
  return null;
}

function ScrollingMenu() {
  return (
    <TableMenuWrapper>
      <MenuButton />
    </TableMenuWrapper>
  );
}

function TableMenu<T>({ row, menuFn }: TableMenuProps<T>) {
  return (
    <TableMenuWrapper>
      <Menu items={menuFn(row)} />
    </TableMenuWrapper>
  );
}

function TableMenuWrapper({ children }: FCWithChildren) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '-0.5rem',
        marginBottom: '-0.5rem',
        height: 'calc(100% + 1rem)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

const LoadingMoreFooter: ComponentType<{ context?: TableContext }> = ({ context }) => {
  if (
    !context ||
    !context.loadMore ||
    !context.height ||
    !(context.loadMore.isLoading || context.loadMore.isError)
  )
    return null;

  return (
    <TableRow
      mt='0.6rem'
      highlightOnHover={false}
      sx={(theme) => ({
        placeItems: 'center',
        height: context.height,
        ...(context.loadMore!.isError && {
          backgroundColor: theme.colors.red[1],
        }),
      })}
    >
      {context.loadMore!.isError ? (
        <Group>
          <Text>Something went wrong while loading</Text>
          <Button color='red.6' onClick={() => context.loadMore!.retry()}>
            Retry
          </Button>
        </Group>
      ) : (
        <Loader variant='dots' />
      )}
    </TableRow>
  );
};

function EmptySeriealNo() {
  return null;
}

function SerialNo({ slno }: { slno: number }) {
  return (
    <div className='virtual-sl-no' title={slno as unknown as string}>
      {slno}
    </div>
  );
}

export function createTableComponent({
  getImageUrl,
  renderImageOnScroll,
  AvatarComponent,
}: CreateTableComponentProps) {
  function Table<T>({
    menu,
    data,
    reset,
    avatar,
    columns,
    isError,
    isLoading,
    loadMore,
    onRowClick,
    gridColumns,
    showHeader = true,
    showSerialNo = true,
    increaseViewportBy = 100,
    atBottomThreshold = 400,
    noDataMessage = 'No data found',
    components: { StickyFooter, StickyHeader, Footer, ...restComponents } = {},
    ...rest
  }: TableProps<T>) {
    const isOnline = useOnlineStatus();
    const [isScrolling, setIsScrolling] = useState(false);
    const { classes } = useStyles();
    const [height, setHeight] = useState(0);

    if (!isOnline) {
      return (
        <InfoWrapper>
          <Stack align='center'>
            <BiWifiOff size={25} />
            <Text>Please check your internet connection</Text>
          </Stack>
        </InfoWrapper>
      );
    }

    if (isLoading) {
      return (
        <InfoWrapper>
          <Loader />
        </InfoWrapper>
      );
    }

    if (isError && !loadMore?.isError) {
      return (
        <InfoWrapper>
          <Stack align='center'>
            <Text>Something went wrong while loading the page</Text>
            <Button color='red.6' onClick={reset}>
              Retry
            </Button>
          </Stack>
        </InfoWrapper>
      );
    }

    if (data.length === 0 && !StickyHeader && !StickyFooter) {
      return (
        <InfoWrapper>
          <Text>{noDataMessage}</Text>
        </InfoWrapper>
      );
    }

    let menuFn: RowHandlerFn<T, MenuItem[]>;
    let MenuComponent: any = EmptyTableMenu;
    let serialHeader: ReactNode = undefined;
    let SerialComponent: any = EmptySeriealNo;
    let onListScrolled: ((isScrolling: boolean) => void) | undefined = undefined;

    if (menu) {
      gridColumns += ' ' + ColumnSizes.Menu;

      if (isScrolling) {
        MenuComponent = ScrollingMenu;
      } else {
        MenuComponent = TableMenu;

        if (typeof menu === 'function') {
          menuFn = menu;
        } else {
          menuFn = (row) => [
            menuItems.edit(() => menu.onEdit(row)),
            menuItems.delete(() => menu.onDelete(row)),
          ];
        }
        if (onRowClick) {
          const oldMenuFn = menuFn;
          menuFn = (row) => [
            {
              icon: <FaBookOpen />,
              label: 'View',
              onClick: () => onRowClick(row),
            },
            ...oldMenuFn(row),
          ];
        }
      }
    }

    if (avatar) {
      gridColumns = ColumnSizes.Avatar + ' ' + gridColumns;
      columns = [...columns];
      columns.splice(0, 0, {
        key: 'avatar',
        cell: (row) => {
          const name = avatar.image?.(row);
          const url = name ? getImageUrl(name) : '';

          let src = isScrolling ? (renderImageOnScroll(url) ? url : undefined) : url;

          return <AvatarComponent src={src} text={avatar.name(row)} />;
        },
      });
    }

    if (avatar?.image || menu) {
      onListScrolled = (newScrolling) => {
        if (newScrolling !== isScrolling) setIsScrolling(newScrolling);
      };
    }

    if (showSerialNo) {
      SerialComponent = SerialNo;
      serialHeader = <div>Sl.No.</div>;
      gridColumns = ColumnSizes.Serial + ' ' + gridColumns;
    }

    const refFns = [
      (node: HTMLDivElement | null) => {
        const newHeight = node?.getBoundingClientRect().height;
        if (newHeight) setHeight(newHeight);
      },
    ];

    return (
      <TypographyStylesProvider className='virtual-wrapper'>
        {showHeader && (
          <TableHeader
            style={{
              gridTemplateColumns: gridColumns,
            }}
          >
            {serialHeader}
            {columns.map((column) => (
              <div key={column.key || column.name} style={column.style}>
                {column.name}
              </div>
            ))}
          </TableHeader>
        )}
        {StickyHeader}
        {data.length === 0 ? (
          <InfoWrapper>
            <Text>{noDataMessage}</Text>
          </InfoWrapper>
        ) : (
          <Virtuoso
            {...rest}
            data={data}
            isScrolling={onListScrolled}
            context={{ height, loadMore }}
            className={classes.virtualBody}
            atBottomStateChange={(atBottom) => {
              if (atBottom) loadMore?.load();
            }}
            atBottomThreshold={atBottomThreshold}
            increaseViewportBy={increaseViewportBy}
            components={{
              Item: TableRowWrapper,
              Footer: Footer || LoadingMoreFooter,
              ...restComponents,
            }}
            itemContent={(index, rowData) => {
              return (
                <TableRow
                  ref={refFns[index]}
                  style={{
                    gridTemplateColumns: gridColumns,
                  }}
                  onClick={onRowClick ? () => onRowClick(rowData) : undefined}
                >
                  <SerialComponent slno={index + 1} />
                  {columns.map((column) => (
                    <div key={column.key || column.name} style={column.style} className='truncate'>
                      {renderCell(rowData, column, index)}
                    </div>
                  ))}
                  <MenuComponent row={rowData} menuFn={menuFn} />
                </TableRow>
              );
            }}
          />
        )}
        {StickyFooter}
      </TypographyStylesProvider>
    );
  }

  return { Table, TableRow, TableHeader, TableRowWrapper };
}
