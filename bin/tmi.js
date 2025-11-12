#!/usr/bin/env node 

const fs = require('node:fs').promises

class Tmi {
	constructor() {
	}

	async main() {
		const lando = JSON.parse(await fs.readFile('lando.json'));
		for (const [k,ss] of Object.entries(lando)) {
			const unrolled = this.unroller(ss);

			if ('TESSELATION' === k) {
				console.log(k, ss.length, 'vs', unrolled.length);
				continue;
			}

			//console.log(unrolled.map(c=>c.join(',')).join('\n'));
			const joined = this.joiner(unrolled);
			console.log(k.padEnd(13), ':', ss.length, 'edges, produced ', unrolled.length, ' chains joined to ', joined.length);
			//console.log(joined.map(j=>j.join(', ')));
		}
	}

	joiner(edges) {
		const pairs = new Map();
		edges.forEach(a=> {
			const k = [a[0], a[a.length-1]].join('->');
			if (pairs.has(k)) pairs.get(k).push(a);
			else pairs.set(k, [a])
		});

		const joined = [];
		for (const pair of pairs.values()) {
			const a = pair[0];
			if (1 == pair.length) {
				joined.push(a);
				continue;
			}
			if (2 != pair.length) {
				throw new Error(`I was wrong:` + pair.length + ' for ' + JSON.stringify(pair));
			}
			const b = pair[1].reverse().slice(1).slice(0,-1);
			joined.push([...a,...b]);
		}
		return joined;
	}

	unroller(edges) {
		let current = null, last = null;
		const unrolled = [];

		for (const edge of edges) {
			if (last === edge.start) {
				current.push(edge.start);
			} else {
				if (current) current.push(last);
				unrolled.push(current = [edge.start]);
			}
			last = edge.end;
		}
	    if (current && last !== null) current.push(last); // ✅ close final chain
		return unrolled;
	}

	// nuts!
	chatgpt_unroller(edges) {
	  const chains = [];
	  const visited = new Set();
	  const adjacency = new Map();

	  // Build adjacency map for quick lookups
	  edges.forEach(({ start, end }) => {
		if (!adjacency.has(start)) adjacency.set(start, []);
		if (!adjacency.has(end)) adjacency.set(end, []);
		adjacency.get(start).push(end);
		adjacency.get(end).push(start);
	  });

	  // Helper to walk a chain starting from a given node
	  const walk = (start) => {
		const chain = [start];
		let prev = null;
		let current = start;

		while (true) {
		  const neighbors = adjacency.get(current) || [];
		  const next = neighbors.find(n => n !== prev && !visited.has(`${current}-${n}`) && !visited.has(`${n}-${current}`));
		  if (!next) break;
		  visited.add(`${current}-${next}`);
		  visited.add(`${next}-${current}`);
		  chain.push(next);
		  prev = current;
		  current = next;
		}
		return chain;
	  };

	  // Walk all edges, building chains
	  for (const { start, end } of edges) {
		if (!visited.has(`${start}-${end}`) && !visited.has(`${end}-${start}`)) {
		  const chain = walk(start);
		  if (chain.length === 1) {
			// Maybe isolated node, check if it links somewhere else
			chain.push(end);
			visited.add(`${start}-${end}`);
			visited.add(`${end}-${start}`);
		  }
		  chains.push(chain);
		}
	  }

	  return chains;
	};

};

new Tmi().main()
