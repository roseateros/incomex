import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { FunctionComponent } from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

export const CreditCardIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#4A90E2' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M2 10 L22 10" stroke={color} strokeWidth="2" />
    <Rect x="6" y="14" width="4" height="2" rx="1" fill={color} />
    <Rect x="12" y="14" width="6" height="2" rx="1" fill={color} />
  </Svg>
);

export const CashIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#27AE60' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="10" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M18 9 L18 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M6 9 L6 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const AppIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#9B59B6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M9 5 L15 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M10 12 L11 13 L14 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="9" y="18" width="6" height="1.5" rx="0.75" fill={color} />
  </Svg>
);

export const ExpenseIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#E74C3C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 8 L12 12 L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 2 L10 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M16 2 L14 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#F39C12' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 9 L21 9" stroke={color} strokeWidth="2" />
    <Path d="M8 2 L8 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 2 L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="8" cy="13" r="1" fill={color} />
    <Circle cx="12" cy="13" r="1" fill={color} />
    <Circle cx="16" cy="13" r="1" fill={color} />
    <Circle cx="8" cy="17" r="1" fill={color} />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

export const ChartIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#3498DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 20 L21 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Rect x="5" y="13" width="3" height="7" rx="1" fill={color} />
    <Rect x="10.5" y="8" width="3" height="12" rx="1" fill={color} />
    <Rect x="16" y="4" width="3" height="16" rx="1" fill={color} />
  </Svg>
);

export const TrendUpIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#27AE60' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17 L9 11 L13 15 L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 7 L21 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M15 7 L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const TrendDownIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#E74C3C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7 L9 13 L13 9 L21 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 17 L21 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M15 17 L21 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FilterIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#95A5A6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6 L20 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 12 L17 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 18 L14 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="7" cy="6" r="2" fill={color} />
    <Circle cx="14" cy="12" r="2" fill={color} />
    <Circle cx="11" cy="18" r="2" fill={color} />
  </Svg>
);

export const PlusIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5 L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M5 12 L19 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

export const SaveIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 21V13H7V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 3V8H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowLeftIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowRightIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 5L19 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DollarIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#27AE60' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const WalletIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#E74C3C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="17" cy="15" r="1.5" fill={color} />
  </Svg>
);

export const TableIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#3498DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 9H21" stroke={color} strokeWidth="2" />
    <Path d="M3 15H21" stroke={color} strokeWidth="2" />
    <Path d="M9 9V21" stroke={color} strokeWidth="2" />
    <Path d="M15 9V21" stroke={color} strokeWidth="2" />
  </Svg>
);

export const ExportIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#27AE60' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BackupIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#3498DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 10V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 12H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ImportIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#9B59B6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 8L12 3L7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ExcelIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#107C41' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M8 8L16 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 8L8 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 8H21" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <Path d="M3 12H21" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <Path d="M3 16H21" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <Path d="M8 3V21" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <Path d="M12 3V21" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <Path d="M16 3V21" stroke={color} strokeWidth="1.5" opacity="0.5" />
  </Svg>
);

export const DatabaseIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#6C5CE7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6C4 4.89543 7.58172 4 12 4C16.4183 4 20 4.89543 20 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M20 6V18C20 19.1046 16.4183 20 12 20C7.58172 20 4 19.1046 4 18V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M20 12C20 13.1046 16.4183 14 12 14C7.58172 14 4 13.1046 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ShieldIcon: FunctionComponent<IconProps> = ({ size = 24, color = '#00B894' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
