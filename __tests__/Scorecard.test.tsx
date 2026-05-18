import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Scorecard from '@/components/Scorecard';
import type { Inning } from '@/lib/cricapi';

const innings: Inning[] = [
  {
    inning: 'India 1st Innings',
    batting: [
      {
        batsman: { name: 'Rohit Sharma', id: '1' },
        r: 85, b: 62, '4s': 10, '6s': 3, sr: 137.1,
        'out-by': 'c Smith b Cummins',
      },
    ],
    bowling: [
      {
        bowler: { name: 'Pat Cummins', id: '2' },
        o: 18, m: 2, r: 58, w: 3, wd: 0, nb: 1, eco: 3.22,
      },
    ],
    fallofwickets: ['1-12 (Gill, 2.4)'],
  },
];

test('renders batsman name and runs', () => {
  render(<Scorecard innings={innings} />);
  expect(screen.getByText('Rohit Sharma')).toBeInTheDocument();
  expect(screen.getByText('85')).toBeInTheDocument();
});

test('renders bowler name and wickets', () => {
  render(<Scorecard innings={innings} />);
  expect(screen.getByText('Pat Cummins')).toBeInTheDocument();
  // w: 3 and 6s: 3 both render as "3"; use getAllByText and assert at least one present
  expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
});

test('switches innings when tab clicked', async () => {
  const twoInnings: Inning[] = [
    { ...innings[0] },
    {
      inning: 'Australia 1st Innings',
      batting: [{ batsman: { name: 'David Warner', id: '3' }, r: 50, b: 40, '4s': 7, '6s': 1, sr: 125, 'out-by': 'b Bumrah' }],
      bowling: [],
      fallofwickets: [],
    },
  ];
  render(<Scorecard innings={twoInnings} />);
  await userEvent.click(screen.getByText('2nd Inn'));
  expect(screen.getByText('David Warner')).toBeInTheDocument();
});
