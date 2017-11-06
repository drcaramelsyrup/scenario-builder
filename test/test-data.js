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
		satisfies: [['toby.mood', true], ['toby.mood.ecstatic', true], ['toby.mood.sad', false]]
	}
];


export { claimTests };