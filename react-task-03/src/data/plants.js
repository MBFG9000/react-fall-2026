export const STATUSES = [
    { value: 'thriving', label: 'Thriving' },
    { value: 'thirsty', label: 'Thirsty' },
    { value: 'recovering', label: 'Recovering' },
];

export const ROOMS = ['Living room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Balcony'];

export const LIGHT_LEVELS = ['Low', 'Medium', 'Bright indirect', 'Direct sun'];

// Every plant has several properties. `resetCount` is part of the key,
// so increasing it tells React to throw away the card's local state.
export const initialPlants = [
    { id: 'p1', name: 'Monstera', species: 'Monstera deliciosa', room: 'Living room', light: 'Bright indirect', waterEveryDays: 7, status: 'thriving', addedAt: 1, resetCount: 0 },
    { id: 'p2', name: 'Snake plant', species: 'Dracaena trifasciata', room: 'Bedroom', light: 'Low', waterEveryDays: 14, status: 'thriving', addedAt: 2, resetCount: 0 },
    { id: 'p3', name: 'Fiddle-leaf fig', species: 'Ficus lyrata', room: 'Living room', light: 'Bright indirect', waterEveryDays: 7, status: 'recovering', addedAt: 3, resetCount: 0 },
    { id: 'p4', name: 'Boston fern', species: 'Nephrolepis exaltata', room: 'Bathroom', light: 'Medium', waterEveryDays: 3, status: 'thirsty', addedAt: 4, resetCount: 0 },
    { id: 'p5', name: 'Golden pothos', species: 'Epipremnum aureum', room: 'Office', light: 'Medium', waterEveryDays: 7, status: 'thriving', addedAt: 5, resetCount: 0 },
    { id: 'p6', name: 'Sweet basil', species: 'Ocimum basilicum', room: 'Kitchen', light: 'Direct sun', waterEveryDays: 2, status: 'thirsty', addedAt: 6, resetCount: 0 },
    { id: 'p7', name: 'Calathea', species: 'Goeppertia orbifolia', room: 'Bedroom', light: 'Medium', waterEveryDays: 5, status: 'recovering', addedAt: 7, resetCount: 0 },
    { id: 'p8', name: 'Jade plant', species: 'Crassula ovata', room: 'Balcony', light: 'Direct sun', waterEveryDays: 21, status: 'thriving', addedAt: 8, resetCount: 0 },
];
