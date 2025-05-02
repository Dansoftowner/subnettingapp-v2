describe('environment', () => {
  it('process object should be defined', () => {
    expect(process).toBeDefined();
  });
  it("NODE_ENV should be 'test'", () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
