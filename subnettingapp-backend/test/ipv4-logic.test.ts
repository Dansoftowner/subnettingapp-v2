import { IPv4Mask } from '../src/ipv4-logic/ipv4-mask';
import { IPv4Address } from '../src/ipv4-logic/ipv4-address';
import { IPv4Subnet } from '../src/ipv4-logic/ipv4-subnet';
import { IPv4SubnetPartitioner } from '../src/ipv4-logic/ipv4-subnet-partitioner';
import { IPv4EqualSubnetSplitter } from '../src/ipv4-logic/ipv4-equal-subnet-splitter';

describe('IPv4Mask', () => {
  test('constructs valid mask and computes asInt correctly', () => {
    const mask24 = new IPv4Mask(24);
    expect(mask24.bitCount).toBe(24);
    expect(mask24.asInt).toBe(0xffffff00);
    expect(mask24.toCidrString()).toBe('/24');
    expect(mask24.toDotDecimalString()).toBe('255.255.255.0');
  });

  test('throws error for invalid masks', () => {
    expect(() => new IPv4Mask(0)).toThrow(/Invalid mask length/);
    expect(() => new IPv4Mask(32)).toThrow(/Invalid mask length/);
  });
});

describe('IPv4Address', () => {
  test('parses dotted-decimal with CIDR', () => {
    const addr = IPv4Address.parse('192.168.1.5/16');
    expect(addr.toIpString()).toBe('192.168.1.5');
    expect(addr.mask.bitCount).toBe(16);
    expect(addr.toString()).toBe('192.168.1.5/16');
  });

  test('defaults mask to /24 when none provided', () => {
    const addr = IPv4Address.parse('10.0.0.1');
    expect(addr.mask.bitCount).toBe(24);
    expect(addr.toString()).toBe('10.0.0.1/24');
  });

  test('throws on invalid IP strings', () => {
    expect(() => IPv4Address.parse('999.0.0.1/24')).toThrow();
    expect(() => IPv4Address.parse('not.an.ip')).toThrow();
  });
});

describe('IPv4Subnet', () => {
  const mask = new IPv4Mask(28);
  const addr = new IPv4Address(0xc0a80105, mask); // 192.168.1.5
  const subnet = new IPv4Subnet(addr);

  test('calculates network, broadcast, first and last host correctly', () => {
    expect(subnet.networkAddress.toString()).toBe('192.168.1.0/28');
    expect(subnet.broadcastAddress.toString()).toBe('192.168.1.15/28');
    expect(subnet.firstHostAddress.toString()).toBe('192.168.1.1/28');
    expect(subnet.lastHostAddress.toString()).toBe('192.168.1.14/28');
  });
});

describe('IPv4SubnetPartitioner', () => {
  const base = IPv4Address.parse('10.0.0.0/27'); // capacity = 32 addresses

  test('throws error when capacity insufficient', () => {
    expect(() => new IPv4SubnetPartitioner(base, [20, 10, 5])).toThrow();
  });

  test('creates correct subnets for valid host counts', () => {
    // For hostCounts 14 and 5 in a /27 base => total addresses: 16 + 8 = 24 <= 32
    const partitioner = new IPv4SubnetPartitioner(base, [14, 5]);
    const subnets = partitioner.subnets;
    expect(subnets).toHaveLength(2);

    // First subnet needs /28 (16 addresses)
    expect(subnets[0].networkAddress.toString()).toBe('10.0.0.0/28');
    expect(subnets[0].broadcastAddress.toString()).toBe('10.0.0.15/28');

    // Second subnet needs /29 (8 addresses)
    expect(subnets[1].networkAddress.toString()).toBe('10.0.0.16/29');
    expect(subnets[1].broadcastAddress.toString()).toBe('10.0.0.23/29');
  });

  test('creates correct subnets for valid host counts', () => {
    const partitioner = new IPv4SubnetPartitioner(
      IPv4Address.parse('192.143.11.11/24'),
      [10, 20, 30, 15],
    );
    const subnets = partitioner.subnets;
    expect(subnets).toHaveLength(4);

    expect(subnets[0].networkAddress.toString()).toBe('192.143.11.0/27');
    expect(subnets[0].broadcastAddress.toString()).toBe('192.143.11.31/27');

    expect(subnets[1].networkAddress.toString()).toBe('192.143.11.32/27');
    expect(subnets[1].broadcastAddress.toString()).toBe('192.143.11.63/27');

    expect(subnets[2].networkAddress.toString()).toBe('192.143.11.64/27');
    expect(subnets[2].broadcastAddress.toString()).toBe('192.143.11.95/27');

    expect(subnets[3].networkAddress.toString()).toBe('192.143.11.96/28');
    expect(subnets[3].broadcastAddress.toString()).toBe('192.143.11.111/28');
  });
});

describe('IPv4EqualSubnetSplitter', () => {
  test('splits a /26 network into 4 equal /28 subnets', () => {
    const base = IPv4Address.parse('202.54.9.192/26');
    const splitter = new IPv4EqualSubnetSplitter(base, 4);
    const subnets = splitter.subnets;
    expect(subnets).toHaveLength(4);
    expect(subnets.map((s) => s.networkAddress.toString())).toEqual([
      '202.54.9.192/28',
      '202.54.9.208/28',
      '202.54.9.224/28',
      '202.54.9.240/28',
    ]);
    expect(subnets.map((s) => s.broadcastAddress.toString())).toEqual([
      '202.54.9.207/28',
      '202.54.9.223/28',
      '202.54.9.239/28',
      '202.54.9.255/28',
    ]);
  });

  test('throws error for non power-of-two count', () => {
    const base = IPv4Address.parse('192.168.0.0/24');
    expect(() => new IPv4EqualSubnetSplitter(base, 3)).toThrow();
  });

  test('throws error when count exceeds maximum possible', () => {
    const base = IPv4Address.parse('10.0.0.0/26'); // hostBits = 6, maxCount = 2^(6-1)=32
    expect(() => new IPv4EqualSubnetSplitter(base, 64)).toThrow();
  });

  test('splits into one subnet returns the original network', () => {
    const base = IPv4Address.parse('172.16.0.0/20');
    const splitter = new IPv4EqualSubnetSplitter(base, 1);
    const subnets = splitter.subnets;
    expect(subnets).toHaveLength(1);
    expect(subnets[0].networkAddress.toString()).toBe('172.16.0.0/20');
    expect(subnets[0].broadcastAddress.toString()).toBe('172.16.15.255/20');
  });
});
