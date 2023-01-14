import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { FaFilter, FaInfoCircle } from 'react-icons/fa';
import {
  Accordion,
  ActionIcon,
  Alert,
  Box,
  Button,
  Center,
  Collapse,
  Group,
  Indicator,
  IndicatorProps,
  Modal,
  Text,
  Tooltip,
  Transition,
} from '@mantine/core';
import { useDisclosure, useSetState } from '@mantine/hooks';

type PartialDispatch<T> = (statePartial: Partial<T> | ((currentState: T) => Partial<T>)) => void;

export type FilterItem<T> = {
  label: string;
  count: (currentFilter: T) => number;
  reset: ((initialFilter: T, setFilter: PartialDispatch<T>) => void) | keyof T | (keyof T)[];
  render: (currentFilter: T, setFilter: PartialDispatch<T>) => JSX.Element;
};

type ValidateFn<T> = (filter: T) => string | void | true;

type FilterProps<T> = {
  initialFilter: T;
  items: FilterItem<T>[];
  validate?: ValidateFn<T>;
};

type FilterButtonApi = {
  open: VoidFunction;
  count: number;
};

export function useFilter<T extends Record<string, unknown>>({
  items,
  validate,
  initialFilter,
}: FilterProps<T>) {
  const [filter, setFilter] = useState(initialFilter);
  const [opened, { open, close }] = useDisclosure(false);

  const count = items.reduce((total, current) => total + current.count(filter), 0);

  const FilterButton = useMemo(
    () => (props: Partial<IndicatorProps>) => {
      const { open, count } = (FilterButton as any).api as FilterButtonApi;

      return (
        <Tooltip label='Advanced Filter' withArrow openDelay={2000}>
          <Indicator
            inline
            size={22}
            disabled={count === 0}
            label={
              <Center>
                <Text>{count}</Text>
              </Center>
            }
            {...props}
          >
            <ActionIcon size='lg' radius='sm' variant='outline' onClick={open}>
              <FaFilter />
            </ActionIcon>
          </Indicator>
        </Tooltip>
      );
    },
    [],
  );

  (FilterButton as any).api = {
    count,
    open,
  } as FilterButtonApi;

  const filterModalProps: FilterModalProps<T> = {
    items,
    opened,
    validate,
    setFilter,
    initialFilter,
    onClose: close,
    currentFilter: filter,
  };

  return { FilterButton, FilterModal, filterModalProps, filter };
}

type FilterModalProps<T> = {
  opened: boolean;
  initialFilter: T;
  currentFilter: T;
  onClose: VoidFunction;
  items: FilterItem<T>[];
  validate?: ValidateFn<T>;
  setFilter: Dispatch<SetStateAction<T>>;
};

function FilterModal<T extends Record<string, unknown>>(props: FilterModalProps<T>) {
  return (
    <Modal size='lg' opened={props.opened} onClose={props.onClose} title='Advanced Filter'>
      <FilterInner {...props} />
    </Modal>
  );
}

function FilterInner<T extends Record<string, unknown>>({
  items,
  onClose,
  validate,
  setFilter,
  initialFilter,
  currentFilter,
}: FilterModalProps<T>) {
  const [tempFilter, setTempFilter] = useSetState(currentFilter);
  const [errorMessage, setErrorMessage] = useState('');

  const count = items.reduce((total, current) => total + current.count(tempFilter), 0);

  return (
    <>
      <Collapse in={Boolean(errorMessage)}>
        <Alert
          mb='md'
          radius='md'
          color='red'
          withCloseButton
          icon={<FaInfoCircle />}
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      </Collapse>

      <Accordion chevronPosition='left'>
        {items.map((item) => (
          <Accordion.Item key={item.label} value={item.label}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Accordion.Control>{item.label}</Accordion.Control>
              <Transition transition='scale' mounted={item.count(tempFilter) > 0}>
                {(style) => (
                  <Button
                    compact
                    size='xs'
                    radius='xl'
                    style={style}
                    variant='outline'
                    onClick={() => {
                      if (typeof item.reset === 'function') {
                        item.reset(initialFilter, setTempFilter);
                      } else if (Array.isArray(item.reset)) {
                        const newFilterState = item.reset.reduce((newFilter, key) => {
                          newFilter[key] = initialFilter[key];
                          return newFilter;
                        }, {} as Partial<T>);
                        setTempFilter(newFilterState);
                      } else {
                        setTempFilter({ [item.reset]: initialFilter[item.reset] } as any);
                      }
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Transition>
            </Box>
            <Accordion.Panel pl={29}>{item.render(tempFilter, setTempFilter)}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <Group mt='xl'>
        <Transition transition='scale' mounted={count > 0}>
          {(style) => (
            <Button
              color='red'
              variant='outline'
              style={{ ...style, width: '7rem' }}
              onClick={() => setTempFilter(initialFilter)}
            >
              Clear All
            </Button>
          )}
        </Transition>
        <Button ml='auto' w='7rem' variant='light' onClick={onClose}>
          Cancel
        </Button>
        <Button
          w='7rem'
          onClick={() => {
            if (validate) {
              const result = validate(tempFilter);
              if (typeof result === 'string') {
                return setErrorMessage(result);
              }
            }
            setFilter(tempFilter);
            onClose();
          }}
        >
          Apply
        </Button>
      </Group>
    </>
  );
}
