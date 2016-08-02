export FOREVER_ROOT=./forever
forever start forever-dev.json
tail -f $FOREVER_ROOT/oosh.log
