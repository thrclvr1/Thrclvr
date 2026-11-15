cd /home/claude/work/v360
for f in test_v360 test_v350 test_v350b test_v348 test_v347 test_v346 test_v345x test_v344 test_v343 test_v342 test_resp test_cov test_links test_lgs test_data31 test_games31 test_sd test_start test_motion test_audio33 test_dict33 test_dict33b test_layout31; do echo "== $f"; timeout 900 python3 -u t360/$f.py 2>&1 | tail -5; done
echo DONE
