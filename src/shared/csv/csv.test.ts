import { CSV_BOM, csvBlob, downloadCsv, escapeCsvCell, reportFilename, toCsv } from './csv';

describe('escapeCsvCell', () => {
  it.each([
    ['plain', 'plain'],
    ['a,b', '"a,b"'],
    ['say "hi"', '"say ""hi"""'],
    ['line\nbreak', '"line\nbreak"'],
    ['cr\rhere', '"cr\rhere"'],
    ['=SUM(A1)', "'=SUM(A1)"],
    ['+1', "'+1"],
    ['-cmd', "'-cmd"],
    ['@user', "'@user"],
    ['=1,2', `"'=1,2"`],
    ['', ''],
  ])('escapes %j', (input, expected) => {
    expect(escapeCsvCell(input)).toBe(expected);
  });

  it('keeps numbers raw and blanks missing values', () => {
    expect(escapeCsvCell(-12)).toBe('-12');
    expect(escapeCsvCell(3.5)).toBe('3.5');
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });
});

describe('toCsv', () => {
  it('writes a header and rows with CRLF', () => {
    const csv = toCsv(
      [
        { key: 'name', header: 'Name' },
        { key: 'qty', header: 'Qty, units' },
      ],
      [{ name: 'Paracare 650', qty: 10 }, { name: 'Say "x"', qty: -2 }, { name: 'Missing' }],
    );
    expect(csv).toBe('Name,"Qty, units"\r\nParacare 650,10\r\n"Say ""x""",-2\r\nMissing,');
  });
});

describe('downloads', () => {
  it('prefixes the BOM', async () => {
    const blob = csvBlob('a,b');
    expect(blob.type).toBe('text/csv;charset=utf-8');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    expect(CSV_BOM).toBe('\uFEFF');
  });

  it('triggers a download through an anchor', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    downloadCsv('report.csv', 'a,b');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('report.csv');
    expect(anchor.href).toBe('blob:test');
    expect(document.querySelector('a[download]')).toBeNull();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    click.mockRestore();
    vi.useRealTimers();
  });

  it('builds report filenames', () => {
    expect(reportFilename('low-stock', new Date(2026, 9, 31, 22))).toBe(
      'medistock-low-stock-2026-10-31.csv',
    );
    expect(reportFilename('expired', new Date(2028, 1, 29))).toBe(
      'medistock-expired-2028-02-29.csv',
    );
  });
});
