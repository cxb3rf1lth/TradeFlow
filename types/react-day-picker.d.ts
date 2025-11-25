import * as React from 'react';

type SingleRange = { from?: Date; to?: Date };

declare module 'react-day-picker' {
  export type DayPickerMode = 'single' | 'multiple' | 'range';

  export interface DayPickerProps extends React.HTMLAttributes<HTMLDivElement> {
    mode?: DayPickerMode;
    selected?: Date | Date[] | SingleRange;
    onSelect?: (value: Date | Date[] | SingleRange | undefined) => void;
    captionLayout?: 'buttons' | 'dropdown';
    numberOfMonths?: number;
    initialFocus?: boolean;
    showOutsideDays?: boolean;
    classNames?: Record<string, string>;
    components?: {
      IconLeft?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      IconRight?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      [key: string]: React.ComponentType<any> | undefined;
    };
  }

  export const DayPicker: React.FC<DayPickerProps>;
}
