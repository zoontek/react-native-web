import Linking from '..';

describe('apis/Linking', () => {
  describe('openURL', () => {
    test('calls open with a url and target', async () => {
      const open = vi.spyOn(window, 'open').mockImplementationOnce(() => null);
      await Linking.openURL('http://foo.com', 'target_name');

      expect(open).toHaveBeenCalledWith(
        'http://foo.com/',
        'target_name',
        'noopener'
      );
    });

    test('defaults target to _blank if not provided', async () => {
      const open = vi.spyOn(window, 'open').mockImplementationOnce(() => null);
      await Linking.openURL('http://foo.com');

      expect(open).toHaveBeenCalledWith(
        'http://foo.com/',
        '_blank',
        'noopener'
      );
    });

    test('accepts undefined as a target', async () => {
      const open = vi.spyOn(window, 'open').mockImplementationOnce(() => null);
      await Linking.openURL('http://foo.com', undefined);

      expect(open).toHaveBeenCalledWith(
        'http://foo.com/',
        undefined,
        'noopener'
      );
    });
  });
});
