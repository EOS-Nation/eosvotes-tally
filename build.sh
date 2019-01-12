#!/bin/sh
docker build . -t eosnation/eosvotes-tally \
	&& docker tag eosnation/eosvotes-tally image.eosn.io/eosnation/eosvotes-tally \
	&& docker push image.eosn.io/eosnation/eosvotes-tally
