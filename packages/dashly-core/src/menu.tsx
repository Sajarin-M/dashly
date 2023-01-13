import { ReactNode, forwardRef } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { FaTrash } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { ActionIcon, ActionIconProps, Menu as MMenu, MenuProps as MMenuProps } from '@mantine/core';
import { PolymorphicComponentProps } from '@mantine/utils';

export type MenuItem = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: VoidFunction;
};

export type MenuProps = MMenuProps & {
  items: MenuItem[];
  buttonProps?: MenuButtonProps;
};

export function Menu({ items, buttonProps, ...rest }: MenuProps) {
  return (
    <MMenu
      {...rest}
      shadow='xl'
      position='left-end'
      offset={-4}
      transition='skew-down'
      withArrow
      withinPortal
    >
      <MMenu.Target>
        <MenuButton {...buttonProps} />
      </MMenu.Target>

      <MMenu.Dropdown>
        {items.map((item) => (
          <MMenu.Item
            key={item.label}
            icon={item.icon}
            onClick={item.onClick}
            disabled={Boolean(item.disabled)}
          >
            {item.label}
          </MMenu.Item>
        ))}
      </MMenu.Dropdown>
    </MMenu>
  );
}

type MenuButtonProps = Partial<PolymorphicComponentProps<'button', ActionIconProps>>;

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>((props, ref) => {
  return (
    <ActionIcon ref={ref} {...props} color='dark' variant='transparent'>
      <BiDotsVerticalRounded size='1.5rem' />
    </ActionIcon>
  );
});

export const menuItems = {
  edit: (handler: VoidFunction) => ({
    label: 'Edit',
    icon: <MdEdit />,
    onClick: handler,
  }),
  delete: (handler: VoidFunction) => ({
    label: 'Delete',
    icon: <FaTrash />,
    onClick: handler,
  }),
};
