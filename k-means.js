/*
m = size of trainingset
c = all points in cluster
ci = cluster item
K = number of clusters
y = centroid
k = index of cluster
*/

function Vector(x, y) {
	this.x = x
	this.y = y
}
Vector.prototype.add = function(v) {
	return new Vector(this.x + v.x, this.y + v.y)
}
Vector.prototype.subtract = function(v) {
	return new Vector(this.x - v.x, this.y - v.y)
}
Vector.prototype.length = function() {
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
}
Vector.prototype.distance = function(v) {
	return this.subtract(v).length();
}
Vector.prototype.clone = function() {
	return new Vector(this.x, this.y)
}
Vector.prototype.toString = function() {
	return "[" + this.x + "," + this.y + "]";
}

var Vectors = {
	mean: function(vs) {
		var s = Vectors.sum(vs), m = vs.length;
		return new Vector(s.x / m, s.y / m);
	},
	sum: function(arr) {
		return _.reduce(arr, function(a,b) { return a.add(b); });
	}
}

function assert(test, msg) {
	if (!test) throw msg
}

function kMeans(K, clusterItems, iterations) {
	assert(K > 1, "Number of clusters (K) should be more than 1.")
	assert(K < clusterItems.length, "Number of clusters (K) should be less than the of the size training set.")

	var centroids = createRandomCentroids(K, clusterItems);
	
	return (function loop(i, distortion) {
		// 1. Cluster Assignment
		// find nearest centroid for each cluster item
		var clusterAssignment = clusterAssignmentStep(centroids, clusterItems);
		// 2. Move Centroid
		// calculate new positions for the centroids
		var moveCentroid = moveCentroidStep(clusterAssignment);
		// 3. Set new Centoids, and continue
		centroids = _.pluck(moveCentroid, "mean");

		var d = computeDistortion(clusterItems.length, moveCentroid);

		assert(!distortion || d <= distortion, "OHNOES! Something must be wrong with the algorithm!");
		
		return d != distortion ? loop(i--, d)
							   : moveCentroid;

	})(iterations);
}

function createRandomCentroids(K, clusterItems) {
	return _.range(0, K).map(function() {
		return clusterItems[Math.floor(Math.random() * clusterItems.length)].clone();
	})
}

function clusterAssignmentStep(centroids, clusterItems) {	
	return clusterItems.map(function(ci) {
		var mapped = centroids.map(function(centroid, k) {
			return [k, ci.distance(centroid)];
		});
		var nearest = _.reduce(mapped, function(min, seed) {
			return min[1] < seed[1] ? min : seed;
		});
		return [nearest[0], ci];
	});
}

function moveCentroidStep(clusterAssignment) {
	var grouped = _.groupBy(clusterAssignment, function(ca) { return ca[0] });
	return _.map(grouped, function(clusterItems, k) {
		var vs = clusterItems.map(function(ci) { return ci[1] })
		return { k: parseInt(k), mean: Vectors.mean(vs), clusterItems: vs };
	});
}

function sum(arr) { return _.reduce(arr, function(a, b) { return a + b }) }
function computeDistortion(m, moveCentroid) {
	var sums = sum(moveCentroid.map(function(move) {
		return sum(move.clusterItems.map(function(ci) { return Math.pow(ci.distance(move.mean), 2) }));
	}));
	return new Vector(sums / m, sums / m).length();
}