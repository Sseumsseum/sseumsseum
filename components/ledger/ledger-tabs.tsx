import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';

import CalendarView from './calendar-view';
import DailyList from './daily-list';

type LedgerTabsProps = {
  renderHeader: () => ReactElement | null;
  selectedDate: string;
  onSelectDate: (dateString: string) => void;
  calendarJumpKey: number;
};

export default function LedgerTabs({
  renderHeader,
  selectedDate,
  onSelectDate,
  calendarJumpKey,
}: LedgerTabsProps) {
  return (
    <Tabs.Container
      renderHeader={renderHeader}
      renderTabBar={(props) => (
        <MaterialTabBar
          {...props}
          activeColor="#1F4F3A"
          inactiveColor="#868686"
          labelStyle={styles.label}
          indicatorStyle={styles.indicator}
          style={styles.tabBar}
        />
      )}
    >
      <Tabs.Tab name="daily" label="일일">
        <DailyList />
      </Tabs.Tab>
      <Tabs.Tab name="calendar" label="달력">
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          calendarJumpKey={calendarJumpKey}
        />
      </Tabs.Tab>
    </Tabs.Container>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  indicator: {
    backgroundColor: '#1F4F3A',
  },
  label: {
    fontSize: 15,
    fontFamily: 'PretendardBold',
    textTransform: 'none',
  },
});
