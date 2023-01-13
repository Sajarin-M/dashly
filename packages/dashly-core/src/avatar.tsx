import { AvatarProps as MAvatarProps, Avatar as MAvatar } from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/utils';

const colors = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
];

function getRandomColor(letter?: string) {
  if (!letter) return '#fff';
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
}

export type AvatarProps = PolymorphicComponentProps<'div', MAvatarProps> & {
  text?: string;
  name?: string;
};

export type CreateAvatarComponentProps = {
  getImageUrl: (name: string) => string;
  defalutProps?: Partial<AvatarProps>;
};

const DEFAULT_PROPS: Partial<AvatarProps> = {
  size: 48,
};

export function createAvatarComponent({ getImageUrl, defalutProps }: CreateAvatarComponentProps) {
  return function Avatar(props: AvatarProps) {
    let { text, name, src, size, ...rest } = {
      ...DEFAULT_PROPS,
      ...defalutProps,
      ...props,
    };

    src = name ? getImageUrl(name) : src;

    return (
      <MAvatar
        {...rest}
        src={src}
        size={size}
        radius='xl'
        styles={{
          placeholder: {
            backgroundColor: getRandomColor(text),
            color: 'white',
          },
        }}
      >
        {text?.charAt(0).toUpperCase()}
      </MAvatar>
    );
  };
}
