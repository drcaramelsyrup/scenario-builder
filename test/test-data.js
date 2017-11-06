const claimTests = [
	{
		name: 'Jill likes Jack',
		statements: ['jill.likes.jack'],
		result: {
			'jill': ['likes'],
			'jill.likes': ['jack'] 
		}
	}, {
		name: 'Jill thinks Jack is 30 cutes',
		statements: ['jill.likes.jack.30'],
		result: {
			'jill': ['likes'],
			'jill.likes': ['jack'],
			'jill.likes.jack': ['30']
		}
	}, {
		name: 'Jill has a pet and likes Jack',
		statements: ['jill.has.pet', 'jill.likes.jack'],
		result: {
			'jill': ['has', 'likes'],
			'jill.has': ['pet'],
			'jill.likes': ['jack']
		}
	}, {
		name: 'Jill has lots of pets',
		statements: ['jill.likes.jack', 'jill.has.pet.dog', 'jill.has.pet.cat', 'jill.has.pet.fish'],
		result: {
			'jill': ['likes', 'has'],
			'jill.likes': ['jack'],
			'jill.has': ['pet'],
			'jill.has.pet': ['dog', 'cat', 'fish']
		}
	}
];

const satisfiesTests = [
	{
		name: "Toby is ecstatic!",
		statements: ['toby.mood.ecstatic'],
		satisfies: [['toby.mood', true], ['toby.mood.ecstatic', true], 
			['toby.mood.sad', false], ['toby', true]]
	}, {
		name: "Toby is forgetful and ecstatic",
		statements: ['toby.mood.ecstatic', 'toby.quality.forgetful.30'],
		satisfies: [['toby.quality', true], ['toby.mood.ecstatic', true], ['toby.quality.forgetful.30', true]]
	}, {
		name: "Toby has mammals as pets",
		statements: ['toby.has.pet.dog', 'toby.has.pet.cat'],
		satisfies: [['toby.has.pet', true], ['toby.has.pet.dog', true], ['toby.has.pet.cat', true],
			['toby.has.pet.fish', false]]
	}, {
		name: "Toby is forgetful as a mood only",
		statements: ['toby.mood.forgetful'],
		satisfies: [['toby.forgetful', false], ['toby.mood.forgetful', true]]
	}
];

export { claimTests, satisfiesTests };